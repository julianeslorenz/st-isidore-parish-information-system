import re
from datetime import date
from io import BytesIO
from pathlib import Path
from typing import Any

from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ASSET_DIR = Path(__file__).resolve().parent.parent / "assets" / "certificates"
TEMPLATE_FILES = {
    "Baptism": "Baptism.jpg",
    "Confirmation": "Confirmation.jpg",
    "Marriage": "Marriage.jpg",
    "Funeral": "Funeral.jpg",
}
MM = 72 / 25.4


def _text(value: Any, limit: int = 220) -> str:
    if value is None:
        return ""
    value = re.sub(r"[\x00-\x1f\x7f]", " ", str(value))
    return re.sub(r"\s+", " ", value).strip()[:limit]


def _date(value: Any) -> str:
    raw = _text(value)
    if not raw:
        return ""
    try:
        parsed = date.fromisoformat(raw[:10])
        return f"{parsed.strftime('%B')} {parsed.day}, {parsed.year}"
    except (ValueError, TypeError):
        return raw


def _date_parts(value: Any) -> tuple[str, str, str]:
    raw = _text(value)
    try:
        parsed = date.fromisoformat(raw[:10])
        return str(parsed.day), parsed.strftime("%B"), str(parsed.year)
    except (ValueError, TypeError):
        return "", raw, ""


def missing_certificate_fields(certificate_type: str, person_name: str, details: dict[str, Any]) -> list[str]:
    required = {
        "Baptism": (("baptismal_date", "Date of baptism"), ("church", "Parish")),
        "Confirmation": (("confirmation_date", "Date of confirmation"), ("church", "Parish")),
        "Marriage": (("groom_name", "Groom's name"), ("bride_name", "Bride's name"), ("marriage_date", "Marriage date"), ("marriage_place", "Marriage place")),
        "Funeral": (("date_of_death", "Date of death"), ("date_of_burial", "Date of burial")),
    }
    missing = []
    if certificate_type == "Marriage":
        for key, label in required[certificate_type]:
            if not _text(details.get(key)):
                missing.append(label)
    elif certificate_type == "Funeral":
        if not _text(details.get("deceased_full_name") or person_name):
            missing.append("Name of deceased")
        for key, label in required[certificate_type]:
            if not _text(details.get(key)):
                missing.append(label)
    else:
        if not _text(person_name):
            missing.append("Full name")
        for key, label in required.get(certificate_type, ()):
            if not _text(details.get(key)):
                missing.append(label)
    return missing


def _draw_text(
    pdf: canvas.Canvas,
    page_height: float,
    x_mm: float,
    y_mm: float,
    value: Any,
    *,
    width_mm: float,
    font: str = "Times-Italic",
    font_size: float = 14,
    align: str = "left",
    min_font_size: float = 8,
) -> None:
    text = _text(value)
    if not text:
        return
    size = font_size
    while size > min_font_size and stringWidth(text, font, size) > width_mm * MM:
        size -= 0.5
    pdf.setFont(font, size)
    x = x_mm * MM
    baseline = page_height - ((y_mm + 3.0) * MM)
    if align == "center":
        pdf.drawCentredString(x, baseline, text)
    elif align == "right":
        pdf.drawRightString(x, baseline, text)
    else:
        pdf.drawString(x, baseline, text)


def _draw_background(pdf: canvas.Canvas, certificate_type: str, width: float, height: float) -> None:
    path = ASSET_DIR / TEMPLATE_FILES[certificate_type]
    if not path.is_file():
        raise ValueError(f"Missing certificate background image: {path.name}")
    pdf.drawImage(ImageReader(str(path)), 0, 0, width=width, height=height, preserveAspectRatio=False, mask="auto")


def _baptism(pdf: canvas.Canvas, height: float, name: str, d: dict[str, Any]) -> None:
    # Coordinates are adapted from the legacy baptismal_pdf.php (FPDF millimetres).
    _draw_text(pdf, height, 135, 78, d.get("church"), width_mm=165, align="center", font_size=15)
    _draw_text(pdf, height, 116, 102, name, width_mm=178, align="center", font="Times-Italic", font_size=19)
    _draw_text(pdf, height, 115, 108, d.get("father_name"), width_mm=160, align="center", font_size=16)
    _draw_text(pdf, height, 115, 117, d.get("mother_name"), width_mm=160, align="center", font_size=16)
    _draw_text(pdf, height, 115, 125.5, d.get("present_address"), width_mm=175, align="center", font_size=13)
    _draw_text(pdf, height, 115, 134, d.get("place_of_birth"), width_mm=175, align="center", font_size=13)
    _draw_text(pdf, height, 115, 143, _date(d.get("birthday")), width_mm=175, align="center", font_size=13)
    _draw_text(pdf, height, 115, 180, d.get("priest"), width_mm=175, align="center", font_size=13)
    _draw_text(pdf, height, 115, 188, _date(d.get("baptismal_date")), width_mm=175, align="center", font_size=13)
    _draw_text(pdf, height, 115, 197, d.get("sponsor_1"), width_mm=175, align="center", font_size=13)
    _draw_text(pdf, height, 115, 207, d.get("sponsor_2"), width_mm=175, align="center", font_size=13)
    _draw_text(pdf, height, 53, 216, d.get("book_number"), width_mm=40, font_size=12)
    _draw_text(pdf, height, 53, 224, d.get("page_number"), width_mm=40, font_size=12)
    _draw_text(pdf, height, 45, 234, d.get("purpose"), width_mm=67, font_size=10)
    _draw_text(pdf, height, 51, 243, _date(d.get("date_issued")), width_mm=72, font_size=10)


def _confirmation(pdf: canvas.Canvas, height: float, name: str, d: dict[str, Any]) -> None:
    # Uses the marked fields from confirmation_pdf.php and the parish's current sheet.
    _draw_text(pdf, height, 135, 75, d.get("church"), width_mm=165, align="center", font_size=14)
    _draw_text(pdf, height, 116, 96, name, width_mm=178, align="center", font_size=19)
    _draw_text(pdf, height, 116, 106, d.get("father_name"), width_mm=165, align="center", font_size=16)
    _draw_text(pdf, height, 116, 115, d.get("mother_name"), width_mm=165, align="center", font_size=16)
    _draw_text(pdf, height, 116, 128, _date(d.get("date_of_baptism")), width_mm=170, align="center", font_size=13)
    _draw_text(pdf, height, 116, 137, d.get("place_of_baptism"), width_mm=170, align="center", font_size=13)
    _draw_text(pdf, height, 135, 173, d.get("church"), width_mm=155, align="center", font_size=13)
    _draw_text(pdf, height, 116, 188, d.get("minister"), width_mm=160, align="center", font_size=13)
    _draw_text(pdf, height, 116, 197, _date(d.get("confirmation_date")), width_mm=160, align="center", font_size=13)
    _draw_text(pdf, height, 116, 205, d.get("sponsor_1"), width_mm=160, align="center", font_size=13)
    _draw_text(pdf, height, 116, 215, d.get("sponsor_2"), width_mm=160, align="center", font_size=13)
    _draw_text(pdf, height, 53, 224, d.get("book_number"), width_mm=40, font_size=12)
    _draw_text(pdf, height, 53, 232, d.get("page_number"), width_mm=40, font_size=12)
    _draw_text(pdf, height, 45, 240, d.get("purpose"), width_mm=67, font_size=10)
    _draw_text(pdf, height, 51, 247, _date(d.get("date_issued")), width_mm=72, font_size=10)


def _marriage(pdf: canvas.Canvas, height: float, d: dict[str, Any]) -> None:
    # Coordinates use the paired columns and lower register block from marriage_pdf.php.
    _draw_text(pdf, height, 135, 82, d.get("parish", "St. Isidore the Farmer Parish"), width_mm=165, align="center", font_size=15)
    _draw_text(pdf, height, 27, 102, d.get("groom_name"), width_mm=80, font_size=12)
    _draw_text(pdf, height, 111, 102, d.get("bride_name"), width_mm=82, font_size=12)
    _draw_text(pdf, height, 27, 119, _date(d.get("groom_birthday")), width_mm=43, font_size=9)
    _draw_text(pdf, height, 72, 119, d.get("groom_age"), width_mm=20, font_size=11)
    _draw_text(pdf, height, 111, 119, _date(d.get("bride_birthday")), width_mm=43, font_size=9)
    _draw_text(pdf, height, 157, 119, d.get("bride_age"), width_mm=20, font_size=11)
    _draw_text(pdf, height, 50, 132, d.get("groom_father_name"), width_mm=54, font_size=11)
    _draw_text(pdf, height, 50, 142, d.get("groom_mother_name"), width_mm=54, font_size=11)
    _draw_text(pdf, height, 40, 154, d.get("groom_parent_address"), width_mm=64, font_size=10)
    _draw_text(pdf, height, 110, 132, d.get("bride_father_name"), width_mm=80, font_size=11)
    _draw_text(pdf, height, 110, 142, d.get("bride_mother_name"), width_mm=80, font_size=11)
    _draw_text(pdf, height, 110, 154, d.get("bride_parent_address"), width_mm=80, font_size=10)
    day, month, year = _date_parts(d.get("marriage_date"))
    _draw_text(pdf, height, 70, 180, day, width_mm=28, font_size=12)
    _draw_text(pdf, height, 45, 180, month, width_mm=55, font_size=12, align="center")
    _draw_text(pdf, height, 118, 180, year, width_mm=30, font_size=12, align="center")
    _draw_text(pdf, height, 80, 190, d.get("marriage_place"), width_mm=120, font_size=12)
    _draw_text(pdf, height, 80, 210, d.get("priest"), width_mm=125, font_size=12)
    _draw_text(pdf, height, 85, 219, d.get("selected_ninong"), width_mm=120, font_size=11)
    _draw_text(pdf, height, 80, 226, d.get("selected_ninang"), width_mm=125, font_size=11)
    _draw_text(pdf, height, 93, 234, d.get("marriage_license_no"), width_mm=110, font_size=10)
    _draw_text(pdf, height, 145, 234, d.get("license_issued_at"), width_mm=55, font_size=9)
    _draw_text(pdf, height, 130, 240, _date(d.get("license_issued_on")), width_mm=73, font_size=9)
    _draw_text(pdf, height, 186, 254, d.get("index_number"), width_mm=20, font_size=12)
    _draw_text(pdf, height, 111, 254, d.get("page_number"), width_mm=20, font_size=12)
    _draw_text(pdf, height, 151, 254, d.get("book_number"), width_mm=20, font_size=12)
    issued_day, issued_month, issued_year = _date_parts(d.get("date_issued"))
    _draw_text(pdf, height, 85, 268, issued_day, width_mm=25, font_size=12)
    _draw_text(pdf, height, 125, 268, issued_month, width_mm=50, font_size=12, align="center")
    _draw_text(pdf, height, 183, 268, issued_year, width_mm=26, font_size=12)
    _draw_text(pdf, height, 108, 273, d.get("purpose"), width_mm=90, font_size=10)


def _funeral(pdf: canvas.Canvas, height: float, d: dict[str, Any], fallback_name: str) -> None:
    # The funeral sheet is landscape; field locations follow funeral_pdf.php and the supplied scan.
    _draw_text(pdf, height, 200, 70, d.get("deceased_full_name") or fallback_name, width_mm=135, align="center", font="Times-Roman", font_size=22, min_font_size=11)
    day, month, year = _date_parts(d.get("date_of_death"))
    _draw_text(pdf, height, 164, 85, day, width_mm=27, align="center", font="Times-Bold", font_size=13)
    _draw_text(pdf, height, 215, 85, month, width_mm=55, align="center", font="Times-Bold", font_size=13)
    _draw_text(pdf, height, 263, 85, year, width_mm=25, align="center", font="Times-Bold", font_size=13)
    _draw_text(pdf, height, 137, 105, d.get("cause_of_death"), width_mm=124, font="Helvetica", font_size=10)
    _draw_text(pdf, height, 137, 110, d.get("informant"), width_mm=124, font="Helvetica", font_size=10)
    _draw_text(pdf, height, 137, 127, _date(d.get("date_of_burial")), width_mm=122, font="Helvetica", font_size=10)
    _draw_text(pdf, height, 137, 131, d.get("officiating_priest_name"), width_mm=122, font="Helvetica", font_size=10)
    _draw_text(pdf, height, 195, 171, d.get("book_number"), width_mm=20, font="Times-Bold", font_size=9)
    _draw_text(pdf, height, 142, 178, d.get("page_number"), width_mm=20, font="Times-Bold", font_size=9)
    _draw_text(pdf, height, 184, 178, d.get("index_number"), width_mm=20, font="Times-Bold", font_size=9)
    _draw_text(pdf, height, 137, 183, d.get("purpose"), width_mm=100, font="Times-Bold", font_size=9)
    _draw_text(pdf, height, 137, 189, _date(d.get("date_issued")), width_mm=90, font="Times-Bold", font_size=9)


def build_certificate_pdf(certificate: Any, include_background: bool = True) -> bytes:
    certificate_type = certificate.certificate_type
    details = certificate.details or {}
    missing = missing_certificate_fields(certificate_type, certificate.person_name, details)
    if missing:
        raise ValueError("Complete these fields before generating the PDF: " + ", ".join(missing))

    page_size = landscape(letter) if certificate_type == "Funeral" else letter
    width, height = page_size
    output = BytesIO()
    pdf = canvas.Canvas(output, pagesize=page_size, pageCompression=1)
    pdf.setTitle(f"{certificate_type} Certificate - {certificate.number}")
    pdf.setAuthor("St. Isidore the Farmer Parish")
    if include_background:
        _draw_background(pdf, certificate_type, width, height)

    if certificate_type == "Baptism":
        _baptism(pdf, height, _text(certificate.person_name), details)
    elif certificate_type == "Confirmation":
        _confirmation(pdf, height, _text(certificate.person_name), details)
    elif certificate_type == "Marriage":
        _marriage(pdf, height, details)
    elif certificate_type == "Funeral":
        _funeral(pdf, height, details, _text(certificate.person_name))
    else:
        raise ValueError("Unsupported certificate type")

    pdf.showPage()
    pdf.save()
    return output.getvalue()
