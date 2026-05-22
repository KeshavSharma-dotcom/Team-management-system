from io import BytesIO

import fitz
import pdfplumber
from pypdf import PdfReader
from fastapi import UploadFile

from resume_checker.exceptions.custom_exceptions import (
    PDFProcessingException,
)
from resume_checker.services.pdf.pdf_validator import (
    validate_pdf_upload,
)
from resume_checker.utils.text_cleaner import (
    clean_resume_text,
)


async def extract_resume_text(
    file: UploadFile,
) -> dict:
    file_bytes = await validate_pdf_upload(
        file,
    )

    extracted_text = (
        extract_text_with_fitz(
            file_bytes,
        )
    )

    if not extracted_text.strip():
        extracted_text = (
            extract_text_with_pdfplumber(
                file_bytes,
            )
        )

    if not extracted_text.strip():
        extracted_text = (
            extract_text_with_pypdf(
                file_bytes,
            )
        )

    if not extracted_text.strip():
        raise PDFProcessingException(
            message=(
                "Unable to extract readable text from PDF"
            ),
        )

    cleaned_text = clean_resume_text(
        extracted_text,
    )

    metadata = extract_pdf_metadata(
        file_bytes,
    )

    return {
        "text": cleaned_text,
        "metadata": metadata,
    }


def extract_text_with_fitz(
    file_bytes: bytes,
) -> str:
    try:
        document = fitz.open(
            stream=file_bytes,
            filetype="pdf",
        )

    except Exception as exc:
        raise PDFProcessingException(
            message=(
                "Failed to open PDF with PyMuPDF"
            ),
        ) from exc

    extracted_pages = []

    try:
        for page in document:
            page_text = (
                page.get_text(
                    "text",
                )
                .strip()
            )

            if page_text:
                extracted_pages.append(
                    page_text,
                )

    finally:
        document.close()

    return "\n\n".join(
        extracted_pages,
    )


def extract_text_with_pdfplumber(
    file_bytes: bytes,
) -> str:
    extracted_pages = []

    try:
        with pdfplumber.open(
            BytesIO(file_bytes),
        ) as pdf:
            for page in pdf.pages:
                page_text = (
                    page.extract_text()
                    or ""
                ).strip()

                if page_text:
                    extracted_pages.append(
                        page_text,
                    )

    except Exception:
        return ""

    return "\n\n".join(
        extracted_pages,
    )


def extract_text_with_pypdf(
    file_bytes: bytes,
) -> str:
    extracted_pages = []

    try:
        reader = PdfReader(
            BytesIO(file_bytes),
        )

        for page in reader.pages:
            page_text = (
                page.extract_text()
                or ""
            ).strip()

            if page_text:
                extracted_pages.append(
                    page_text,
                )

    except Exception:
        return ""

    return "\n\n".join(
        extracted_pages,
    )


def extract_pdf_metadata(
    file_bytes: bytes,
) -> dict:
    try:
        reader = PdfReader(
            BytesIO(file_bytes),
        )

    except Exception:
        return build_empty_metadata()

    metadata = reader.metadata or {}

    return {
        "page_count": len(
            reader.pages,
        ),
        "title": safe_metadata_value(
            metadata.get("/Title"),
        ),
        "author": safe_metadata_value(
            metadata.get("/Author"),
        ),
        "creator": safe_metadata_value(
            metadata.get("/Creator"),
        ),
        "producer": safe_metadata_value(
            metadata.get("/Producer"),
        ),
    }


def safe_metadata_value(
    value,
) -> str | None:
    if not value:
        return None

    normalized_value = str(
        value,
    ).strip()

    if not normalized_value:
        return None

    return normalized_value


def build_empty_metadata() -> dict:
    return {
        "page_count": 0,
        "title": None,
        "author": None,
        "creator": None,
        "producer": None,
    }