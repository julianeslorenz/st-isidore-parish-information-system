"""Insert or refresh clearly marked sample records for every supported sacrament."""

from datetime import UTC, date, datetime

from sqlalchemy import select

from app.db import SessionLocal
from app.models import Certificate, ParishRecord


PARISH = "St. Isidore the Farmer Parish, Agdangan, Quezon"
ADDRESS = "Demo Street, Agdangan, Quezon"
PRIEST = "Demo Parish Priest"
DATE_ISSUED = date.today().isoformat()

DEMO_RECORDS = [
    ParishRecord(
        sacrament_type="Baptism",
        record_number="DEMO-BAPTISM-001",
        person_name="Demo Baptism Child",
        record_date=datetime(2010, 6, 12),
        details={
            "index_number": 1,
            "book_number": 1,
            "page_number": 1,
            "name": "Demo Baptism Child",
            "baptismal_date": "2010-06-12",
            "birthday": "2010-05-20",
            "place_of_birth": "Agdangan, Quezon",
            "legitimacy": "CATH",
            "father_name": "Demo Father Santos",
            "father_place_of_birth": "Agdangan, Quezon",
            "father_present_address": ADDRESS,
            "mother_name": "Demo Mother Santos",
            "mother_place_of_birth": "Agdangan, Quezon",
            "mother_present_address": ADDRESS,
            "present_address": ADDRESS,
            "sponsor_1": "Demo Godparent One",
            "S1_address": ADDRESS,
            "sponsor_2": "Demo Godparent Two",
            "S2_address": ADDRESS,
            "stipendium_amount": "0",
            "priest_name": PRIEST,
            "priest": PRIEST,
            "church": PARISH,
            "purpose": "DEMO ONLY - certificate layout testing",
            "date_issued": DATE_ISSUED,
        },
    ),
    ParishRecord(
        sacrament_type="Confirmation",
        record_number="DEMO-CONFIRMATION-001",
        person_name="Demo Confirmand Santos",
        record_date=datetime(2019, 9, 21),
        details={
            "index_number": 1,
            "book_number": 1,
            "page_number": 1,
            "name": "Demo Confirmand Santos",
            "confirmation_date": "2019-09-21",
            "age": 14,
            "parish": PARISH,
            "address": ADDRESS,
            "date_of_baptism": "2005-04-16",
            "place_of_baptism": PARISH,
            "birthday": "2005-05-20",
            "present_address": ADDRESS,
            "church": PARISH,
            "father_name": "Demo Father Santos",
            "mother_name": "Demo Mother Santos",
            "sponsor_1": "Demo Confirmation Sponsor One",
            "sponsor_2": "Demo Confirmation Sponsor Two",
            "minister": PRIEST,
            "purpose": "DEMO ONLY - certificate layout testing",
            "date_issued": DATE_ISSUED,
        },
    ),
    ParishRecord(
        sacrament_type="Marriage",
        record_number="DEMO-MARRIAGE-001",
        person_name="Demo Groom Santos & Demo Bride Reyes",
        record_date=datetime(2022, 2, 14),
        details={
            "index_number": 1,
            "book_number": 1,
            "page_number": 1,
            "groom_name": "Demo Groom Santos",
            "groom_civil_status": "Single",
            "groom_age": 28,
            "groom_birthday": "1993-10-05",
            "groom_place_of_birth": "Agdangan, Quezon",
            "groom_address": ADDRESS,
            "groom_father_name": "Demo Groom Father",
            "groom_mother_name": "Demo Groom Mother",
            "groom_parent_address": ADDRESS,
            "bride_name": "Demo Bride Reyes",
            "bride_civil_status": "Single",
            "bride_age": 26,
            "bride_birthday": "1995-07-18",
            "bride_place_of_birth": "Agdangan, Quezon",
            "bride_address": ADDRESS,
            "bride_father_name": "Demo Bride Father",
            "bride_mother_name": "Demo Bride Mother",
            "bride_parent_address": ADDRESS,
            "marriage_date": "2022-02-14",
            "marriage_place": PARISH,
            "parish": PARISH,
            "officiating_priest": PRIEST,
            "priest": PRIEST,
            "ninong_1": "Demo Principal Sponsor",
            "ninong_1_address": ADDRESS,
            "ninang_1": "Demo Principal Sponsor",
            "ninang_1_address": ADDRESS,
            "selected_ninong": "Demo Principal Ninong",
            "selected_ninang": "Demo Principal Ninang",
            "marriage_license_no": "DEMO-LICENSE-001",
            "license_issued_at": "Agdangan, Quezon",
            "license_issued_on": "2022-01-10",
            "pesos": 0,
            "cts": 0,
            "observanda": "DEMO ONLY - no legal or civil registration value",
            "purpose": "DEMO ONLY - certificate layout testing",
            "date_issued": DATE_ISSUED,
        },
    ),
    ParishRecord(
        sacrament_type="Funeral",
        record_number="DEMO-FUNERAL-001",
        person_name="Demo Deceased Parishioner",
        record_date=datetime(2024, 3, 8),
        details={
            "index_number": 1,
            "book_number": 1,
            "page_number": 1,
            "deceased_full_name": "Demo Deceased Parishioner",
            "date_of_death": "2024-03-05",
            "date_of_burial": "2024-03-08",
            "deceased_age": 72,
            "civil_status": "Widow",
            "deceased_address": ADDRESS,
            "address": ADDRESS,
            "church": PARISH,
            "received_sacrament": "UI",
            "cause_of_death": "Sample cause - demo data only",
            "burial_place": "Demo Parish Cemetery",
            "class_of_service": "DEMO",
            "mother_full_name": "Demo Deceased Mother",
            "father_full_name": "Demo Deceased Father",
            "mother_name": "Demo Deceased Mother",
            "father_name": "Demo Deceased Father",
            "spouse_full_name": "Demo Deceased Spouse",
            "officiating_priest_name": PRIEST,
            "informant": "Demo Informant",
            "pesos": 0,
            "cts": 0,
            "additional_observations": "DEMO ONLY - no official parish or civil value",
            "purpose": "DEMO ONLY - certificate layout testing",
            "date_issued": DATE_ISSUED,
        },
    ),
]

CERTIFICATE_NUMBERS = {
    "Baptism": "DEMO-BC-001",
    "Confirmation": "DEMO-CF-001",
    "Marriage": "DEMO-MC-001",
    "Funeral": "DEMO-FC-001",
}


def main() -> None:
    added = 0
    refreshed = 0
    certificates_added = 0
    certificates_refreshed = 0
    with SessionLocal() as db:
        for sample in DEMO_RECORDS:
            existing = db.scalar(
                select(ParishRecord).where(
                    ParishRecord.record_number == sample.record_number
                )
            )
            if existing is None:
                db.add(sample)
                added += 1
            else:
                existing.sacrament_type = sample.sacrament_type
                existing.person_name = sample.person_name
                existing.record_date = sample.record_date
                existing.details = sample.details
                refreshed += 1

            certificate_number = CERTIFICATE_NUMBERS[sample.sacrament_type]
            certificate = db.scalar(
                select(Certificate).where(Certificate.number == certificate_number)
            )
            if certificate is None:
                certificate = Certificate(
                    number=certificate_number,
                    person_name=sample.person_name,
                    certificate_type=sample.sacrament_type,
                    status="processing",
                    details=dict(sample.details),
                    history=[{
                        "date": datetime.now(UTC).isoformat(),
                        "text": "DEMO ONLY - seeded for certificate layout testing",
                    }],
                )
                db.add(certificate)
                certificates_added += 1
            else:
                certificate.person_name = sample.person_name
                certificate.certificate_type = sample.sacrament_type
                certificate.status = "processing"
                certificate.details = dict(sample.details)
                certificate.history = [{
                    "date": datetime.now(UTC).isoformat(),
                    "text": "DEMO ONLY - seeded for certificate layout testing",
                }]
                certificates_refreshed += 1
        db.commit()

    print(f"Added {added} demo record(s); refreshed {refreshed} existing demo record(s).")
    print(f"Added {certificates_added} demo certificate(s); refreshed {certificates_refreshed} existing demo certificate(s).")
    print("All samples are fictional and marked DEMO. Delete them from Sacramental records and Certificates when done.")


if __name__ == "__main__":
    main()
