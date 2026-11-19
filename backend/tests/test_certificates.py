import pytest

from conftest import token_for


def auth(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.parametrize(
    ("certificate_type", "person_name", "details"),
    [
        ("Baptism", "Mika Santos", {"baptismal_date": "2020-05-10", "church": "St. Isidore Parish"}),
        ("Confirmation", "Mika Santos", {"confirmation_date": "2026-05-10", "church": "St. Isidore Parish"}),
        ("Marriage", "Alex Reyes and Jamie Cruz", {"groom_name": "Alex Reyes", "bride_name": "Jamie Cruz", "marriage_date": "2026-06-15", "marriage_place": "St. Isidore Parish"}),
        ("Funeral", "Ramon Cruz", {"deceased_full_name": "Ramon Cruz", "date_of_death": "2026-07-01", "date_of_burial": "2026-07-03"}),
    ],
)
def test_staff_can_open_authenticated_certificate_pdf(client, certificate_type, person_name, details):
    admin_token = token_for(client, "admin@example.org")
    created = client.post(
        "/api/v1/certificates",
        headers=auth(admin_token),
        json={"person_name": person_name, "certificate_type": certificate_type, "details": details},
    )
    assert created.status_code == 201

    response = client.get(f"/api/v1/certificates/{created.json()['id']}/pdf", headers=auth(admin_token))
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/pdf")
    assert response.content.startswith(b"%PDF-")
    assert b"/Subtype /Image" in response.content

    text_only = client.get(
        f"/api/v1/certificates/{created.json()['id']}/pdf?background=false",
        headers=auth(admin_token),
    )
    assert text_only.status_code == 200
    assert text_only.content.startswith(b"%PDF-")
    assert b"/Subtype /Image" not in text_only.content


def test_certificate_pdf_requires_office_role_and_complete_fields(client):
    admin_token = token_for(client, "admin@example.org")
    member = client.post(
        "/api/v1/auth/register",
        json={"email": "certificate-member@example.org", "name": "Certificate Member", "password": "strong-pass-123"},
    ).json()
    member_token = token_for(client, member["email"], "strong-pass-123")
    created = client.post(
        "/api/v1/certificates",
        headers=auth(admin_token),
        json={"person_name": "Mika Santos", "certificate_type": "Baptism", "details": {}},
    ).json()

    assert client.get(f"/api/v1/certificates/{created['id']}/pdf").status_code == 401
    assert client.get(f"/api/v1/certificates/{created['id']}/pdf", headers=auth(member_token)).status_code == 403
    incomplete = client.get(f"/api/v1/certificates/{created['id']}/pdf", headers=auth(admin_token))
    assert incomplete.status_code == 422
    assert "Date of baptism" in incomplete.json()["detail"]

    funeral = client.post(
        "/api/v1/certificates",
        headers=auth(admin_token),
        json={"person_name": "Ramon Cruz", "certificate_type": "Funeral", "details": {"date_of_death": "2026-07-01"}},
    ).json()
    missing_burial_date = client.get(f"/api/v1/certificates/{funeral['id']}/pdf", headers=auth(admin_token))
    assert missing_burial_date.status_code == 422
    assert "Date of burial" in missing_burial_date.json()["detail"]

    missing = client.get("/api/v1/certificates/999999/pdf", headers=auth(admin_token))
    assert missing.status_code == 404


def test_certificate_pdf_is_unavailable_after_certificate_leaves_preparation(client):
    admin_token = token_for(client, "admin@example.org")
    created = client.post(
        "/api/v1/certificates",
        headers=auth(admin_token),
        json={"person_name": "Mika Santos", "certificate_type": "Baptism", "details": {"baptismal_date": "2020-05-10", "church": "St. Isidore Parish"}},
    ).json()
    assert client.patch(f"/api/v1/certificates/{created['id']}", headers=auth(admin_token), json={"status": "ready"}).status_code == 200
    response = client.get(f"/api/v1/certificates/{created['id']}/pdf", headers=auth(admin_token))
    assert response.status_code == 409


def test_office_can_prepare_a_parishioner_certificate_request(client):
    member = client.post(
        "/api/v1/auth/register",
        json={"email": "certificate-requester@example.org", "name": "Certificate Requester", "password": "strong-pass-123"},
    ).json()
    member_token = token_for(client, member["email"], "strong-pass-123")
    requested = client.post(
        "/api/v1/certificates/request",
        headers=auth(member_token),
        json={"person_name": member["name"], "certificate_type": "Baptism", "details": {"purpose": "School record"}},
    )
    certificate_id = requested.json()["id"]
    admin_token = token_for(client, "admin@example.org")
    prepared = client.patch(
        f"/api/v1/certificates/{certificate_id}/details",
        headers=auth(admin_token),
        json={"person_name": member["name"], "details": {"purpose": "School record", "baptismal_date": "2018-04-15", "church": "St. Isidore Parish"}},
    )
    assert prepared.status_code == 200
    pdf = client.get(f"/api/v1/certificates/{certificate_id}/pdf", headers=auth(admin_token))
    assert pdf.status_code == 200 and pdf.content.startswith(b"%PDF-")
