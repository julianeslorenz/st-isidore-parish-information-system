from datetime import datetime, timedelta

from conftest import sent_verification_tokens, token_for


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_health_and_auth_requirements(client):
    assert client.get("/health").json() == {"status": "ok"}
    assert client.get("/api/v1/requests").status_code == 401
    response = client.post("/api/v1/auth/register", json={"email": "parishioner@example.org", "name": "A Parishioner", "password": "strong-pass-123"})
    assert response.status_code == 201 and response.json()["email_sent"] is True
    assert "hashed_password" not in response.json()
    assert client.post("/api/v1/auth/register", json={"email": "parishioner@example.org", "name": "Duplicate", "password": "strong-pass-123"}).status_code == 409


def test_new_account_cannot_sign_in_until_email_is_verified(client):
    email = "verify@example.org"
    password = "strong-pass-123"
    created = client.post("/api/v1/auth/register", json={"email": email, "name": "Verify Member", "password": password})
    assert created.status_code == 201 and created.json()["email_sent"] is True
    assert client.post("/api/v1/auth/login", json={"email": email, "password": password}).status_code == 403

    token = sent_verification_tokens[email]
    verified = client.post("/api/v1/auth/verify-email", json={"token": token})
    assert verified.status_code == 200
    assert client.post("/api/v1/auth/login", json={"email": email, "password": password}).status_code == 200
    assert client.post("/api/v1/auth/verify-email", json={"token": token}).status_code == 200


def test_parishioner_can_delete_their_account_after_password_confirmation(client):
    email = "delete-member@example.org"
    password = "strong-pass-123"
    client.post("/api/v1/auth/register", json={"email": email, "name": "Delete Member", "password": password})
    token = token_for(client, email, password)
    headers = auth(token)

    assert client.request("DELETE", "/api/v1/auth/me", headers=headers, json={"password": "wrong-password", "confirmation": "DELETE"}).status_code == 400
    assert client.request("DELETE", "/api/v1/auth/me", headers=headers, json={"password": password, "confirmation": "DELETE-ME"}).status_code == 422
    deleted = client.request("DELETE", "/api/v1/auth/me", headers=headers, json={"password": password, "confirmation": "DELETE"})
    assert deleted.status_code == 204
    assert client.get("/api/v1/auth/me", headers=headers).status_code == 401
    assert client.post("/api/v1/auth/login", json={"email": email, "password": password}).status_code == 401

    admin_token = token_for(client, "admin@example.org")
    assert client.request("DELETE", "/api/v1/auth/me", headers=auth(admin_token), json={"password": "VeryStrongPassword42!", "confirmation": "DELETE"}).status_code == 403


def test_parishioner_requests_are_private_and_cancelable(client):
    first = client.post("/api/v1/auth/register", json={"email": "one@example.org", "name": "One Member", "password": "strong-pass-123"}).json()
    second = client.post("/api/v1/auth/register", json={"email": "two@example.org", "name": "Two Member", "password": "strong-pass-123"}).json()
    one_token = token_for(client, first["email"], "strong-pass-123")
    two_token = token_for(client, second["email"], "strong-pass-123")
    starts_at = (datetime.now() + timedelta(days=10)).replace(microsecond=0).isoformat()
    created = client.post("/api/v1/requests", headers=auth(one_token), json={"sacrament_type": "Baptism", "schedule_at": starts_at, "details": {"person_name": "Baby One"}})
    assert created.status_code == 201
    request_id = created.json()["id"]
    assert [r["id"] for r in client.get("/api/v1/requests", headers=auth(one_token)).json()] == [request_id]
    assert client.get("/api/v1/requests", headers=auth(two_token)).json() == []
    assert client.post(f"/api/v1/requests/{request_id}/cancel", headers=auth(two_token)).status_code == 404
    assert client.post(f"/api/v1/requests/{request_id}/cancel", headers=auth(one_token)).status_code == 200


def test_staff_role_checks_and_records_crud(client):
    parishioner = client.post("/api/v1/auth/register", json={"email": "member@example.org", "name": "Member", "password": "strong-pass-123"}).json()
    parishioner_token = token_for(client, parishioner["email"], "strong-pass-123")
    assert client.get("/api/v1/records", headers=auth(parishioner_token)).status_code == 403
    admin_token = token_for(client, "admin@example.org")
    created = client.post("/api/v1/records", headers=auth(admin_token), json={"sacrament_type": "Baptism", "person_name": "Member Name", "record_number": "B-001", "details": {"book": 3}})
    assert created.status_code == 201
    assert created.json()["record_number"] == "B-001"
    updated = client.patch(f"/api/v1/records/{created.json()['id']}", headers=auth(admin_token), json={"person_name": "Updated Name"})
    assert updated.status_code == 200 and updated.json()["name"] == "Updated Name"
    assert client.delete(f"/api/v1/records/{created.json()['id']}", headers=auth(admin_token)).status_code == 204


def test_certificate_signing_and_release_are_role_gated(client):
    admin_token = token_for(client, "admin@example.org")
    secretary_token = token_for(client, "secretary@example.org")
    priest_token = token_for(client, "priest@example.org")
    created = client.post("/api/v1/certificates", headers=auth(admin_token), json={"person_name": "Member Name", "certificate_type": "Baptism"})
    certificate_id = created.json()["id"]
    assert client.patch(f"/api/v1/certificates/{certificate_id}", headers=auth(secretary_token), json={"status": "signature"}).status_code == 200
    assert client.patch(f"/api/v1/certificates/{certificate_id}", headers=auth(secretary_token), json={"status": "ready"}).status_code == 403
    assert client.patch(f"/api/v1/certificates/{certificate_id}", headers=auth(priest_token), json={"status": "ready"}).status_code == 200
    assert client.patch(f"/api/v1/certificates/{certificate_id}", headers=auth(secretary_token), json={"status": "released"}).status_code == 200
    assert client.patch(f"/api/v1/certificates/{certificate_id}", headers=auth(priest_token), json={"status": "signature"}).status_code == 409


def test_approval_creates_parishioner_appointment(client):
    member = client.post("/api/v1/auth/register", json={"email": "requester@example.org", "name": "Requester", "password": "strong-pass-123"}).json()
    member_token = token_for(client, member["email"], "strong-pass-123")
    admin_token = token_for(client, "admin@example.org")
    starts_at = (datetime.now() + timedelta(days=12)).replace(microsecond=0).isoformat()
    request = client.post("/api/v1/requests", headers=auth(member_token), json={"sacrament_type": "Baptism", "schedule_at": starts_at, "details": {"person_name": "Baby Requester"}}).json()
    approved = client.patch(f"/api/v1/requests/{request['id']}", headers=auth(admin_token), json={"status": "approved"})
    assert approved.status_code == 200
    appointments = client.get("/api/v1/appointments", headers=auth(member_token)).json()
    assert len(appointments) == 1
    assert appointments[0]["title"] == "Baptism appointment"


def test_messages_are_private_and_read_state_is_server_side(client):
    member = client.post("/api/v1/auth/register", json={"email": "messages@example.org", "name": "Message Member", "password": "strong-pass-123"}).json()
    member_token = token_for(client, member["email"], "strong-pass-123")
    secretary_token = token_for(client, "secretary@example.org")
    outsider = client.post("/api/v1/auth/register", json={"email": "outsider@example.org", "name": "Outsider", "password": "strong-pass-123"}).json()
    outsider_token = token_for(client, outsider["email"], "strong-pass-123")
    sent = client.post("/api/v1/messages", headers=auth(secretary_token), json={"receiver_id": member["id"], "body": "Your request was received."})
    assert sent.status_code == 201
    thread = client.get("/api/v1/messages", headers=auth(member_token)).json()
    assert len(thread) == 1 and thread[0]["unread_count"] == 1
    assert client.get("/api/v1/messages", headers=auth(outsider_token)).json() == []
    setting = client.patch(f"/api/v1/messages/conversations/{thread[0]['sender_id']}", headers=auth(member_token), json={"unread": False, "archived": True})
    assert setting.status_code == 200 and setting.json()["archived"] is True
    refreshed = client.get("/api/v1/messages", headers=auth(member_token)).json()
    assert refreshed[0]["unread_count"] == 0 and refreshed[0]["archived"] is True


def test_public_events_and_staff_mutations(client):
    assert client.get("/api/v1/events").status_code == 200
    member = client.post("/api/v1/auth/register", json={"email": "event-member@example.org", "name": "Member", "password": "strong-pass-123"}).json()
    member_token = token_for(client, member["email"], "strong-pass-123")
    starts_at = (datetime.now() + timedelta(days=20)).replace(microsecond=0).isoformat()
    payload = {"title": "Parish Day", "category": "Community", "starts_at": starts_at, "place": "Parish hall"}
    assert client.post("/api/v1/events", headers=auth(member_token), json=payload).status_code == 403
    admin_token = token_for(client, "admin@example.org")
    created = client.post("/api/v1/events", headers=auth(admin_token), json=payload)
    assert created.status_code == 201
    listed = client.get("/api/v1/events").json()
    assert any(event["title"] == "Parish Day" for event in listed)


def test_reports_use_database_counts_and_are_staff_only(client):
    member = client.post("/api/v1/auth/register", json={"email": "report-member@example.org", "name": "Report Member", "password": "strong-pass-123"}).json()
    member_token = token_for(client, member["email"], "strong-pass-123")
    admin_token = token_for(client, "admin@example.org")
    client.post("/api/v1/requests", headers=auth(member_token), json={"sacrament_type": "Marriage", "details": {"person_name": "Two members"}})
    client.post("/api/v1/requests", headers=auth(member_token), json={"sacrament_type": "Baptism", "details": {"person_name": "A child"}})
    assert client.get("/api/v1/reports?months=1").status_code == 401
    assert client.get("/api/v1/reports?months=1", headers=auth(member_token)).status_code == 403
    report = client.get("/api/v1/reports?months=1", headers=auth(admin_token)).json()
    assert report["total"] == 2
    assert sum(item["count"] for item in report["sacraments"]) == 2


def test_same_priest_cannot_be_double_booked(client):
    admin_token = token_for(client, "admin@example.org")
    priest = client.post("/api/v1/priests", headers=auth(admin_token), json={"name": "Fr. Sample", "title": "Parish priest"}).json()
    assert priest["id"]
    starts_at = (datetime.now() + timedelta(days=15)).replace(microsecond=0).isoformat()
    appointment = {"title": "Baptism", "appointment_type": "Baptism", "start_at": starts_at, "priest_id": priest["id"]}
    assert client.post("/api/v1/appointments", headers=auth(admin_token), json=appointment).status_code == 201
    assert client.post("/api/v1/appointments", headers=auth(admin_token), json=appointment).status_code == 409
    overlap = {**appointment, "start_at": (datetime.fromisoformat(starts_at) + timedelta(minutes=15)).isoformat()}
    assert client.post("/api/v1/appointments", headers=auth(admin_token), json=overlap).status_code == 409


def test_profile_and_password_changes_use_authenticated_account(client):
    member = client.post("/api/v1/auth/register", json={"email": "profile@example.org", "name": "Profile Member", "password": "strong-pass-123"}).json()
    member_token = token_for(client, member["email"], "strong-pass-123")
    changed = client.patch("/api/v1/auth/me", headers=auth(member_token), json={"name": "Updated Member", "barangay": "San Isidro", "profile": {"zone": "Zone 2"}})
    assert changed.status_code == 200
    assert changed.json()["name"] == "Updated Member" and changed.json()["profile"]["zone"] == "Zone 2"
    assert client.post("/api/v1/auth/change-password", headers=auth(member_token), json={"current_password": "wrong-password", "new_password": "new-strong-pass-123"}).status_code == 400
    updated = client.post("/api/v1/auth/change-password", headers=auth(member_token), json={"current_password": "strong-pass-123", "new_password": "new-strong-pass-123"})
    assert updated.status_code == 200
    assert client.post("/api/v1/auth/login", json={"email": member["email"], "password": "strong-pass-123"}).status_code == 401
    assert client.post("/api/v1/auth/login", json={"email": member["email"], "password": "new-strong-pass-123"}).status_code == 200


def test_password_reset_request_does_not_disclose_account_existence(client):
    client.post("/api/v1/auth/register", json={"email": "reset@example.org", "name": "Reset Member", "password": "strong-pass-123"})
    found = client.post("/api/v1/auth/password-reset", json={"email": "reset@example.org"})
    missing = client.post("/api/v1/auth/password-reset", json={"email": "missing@example.org"})
    assert found.status_code == missing.status_code == 202
    assert found.json() == missing.json()
