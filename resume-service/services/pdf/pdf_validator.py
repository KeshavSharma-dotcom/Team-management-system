from io import BytesIO

import fitz
from pypdf import PdfReader
from fastapi import UploadFile

from resume_checker.core.constants import (
    MAX_PDF_PAGE_COUNT,
)
from resume_checker.core.security import (
    validate_uploaded_file,
)
from resume_checker.exceptions.custom_exceptions import (
    FileValidationException,
    InvalidPDFSignatureException,
    PDFProcessingException,
)


async def validate_pdf_upload(
    file: UploadFile,
) -> bytes:
    file_bytes = await read_uploaded_file(
        file,
    )

    validate_uploaded_file(
        file=file,
        file_size=len(file_bytes),
    )

    validate_pdf_signature(
        file_bytes,
    )

    validate_pdf_structure(
        file_bytes,
    )

    validate_pdf_page_count(
        file_bytes,
    )

    validate_pdf_content(
        file_bytes,
    )

    return file_bytes


async def validate_pdf_file(
    file: UploadFile,
) -> bool:
    file_bytes = await read_uploaded_file(
        file,
    )

    validate_uploaded_file(
        file=file,
        file_size=len(file_bytes),
    )

    validate_pdf_signature(
        file_bytes,
    )

    return True


async def read_uploaded_file(
    file: UploadFile,
) -> bytes:
    try:
        file_bytes = await file.read()

    except Exception as exc:
        raise FileValidationException(
            message=(
                "Failed to read uploaded file"
            ),
        ) from exc

    if not file_bytes:
        raise FileValidationException(
            message="Uploaded file is empty",
        )

    return file_bytes


def validate_pdf_signature(
    file_bytes: bytes,
) -> None:
    pdf_signature = b"%PDF"

    if not file_bytes.startswith(
        pdf_signature,
    ):
        raise InvalidPDFSignatureException()


def validate_pdf_structure(
    file_bytes: bytes,
) -> None:
    try:
        pdf_stream = BytesIO(
            file_bytes,
        )

        reader = PdfReader(
            pdf_stream,
        )

    except Exception as exc:
        raise PDFProcessingException(
            message=(
                "Malformed PDF structure"
            ),
        ) from exc

    if reader.is_encrypted:
        raise PDFProcessingException(
            message=(
                "Encrypted PDFs are not supported"
            ),
        )

    if not reader.pages:
        raise PDFProcessingException(
            message="PDF contains no pages",
        )


def validate_pdf_page_count(
    file_bytes: bytes,
) -> None:
    try:
        document = fitz.open(
            stream=file_bytes,
            filetype="pdf",
        )

    except Exception as exc:
        raise PDFProcessingException(
            message=(
                "Unable to inspect PDF pages"
            ),
        ) from exc

    page_count = document.page_count

    document.close()

    if page_count <= 0:
        raise PDFProcessingException(
            message=(
                "PDF contains no valid pages"
            ),
        )

    if page_count > MAX_PDF_PAGE_COUNT:
        raise PDFProcessingException(
            message=(
                "PDF exceeds maximum page limit"
            ),
            details={
                "max_pages": (
                    MAX_PDF_PAGE_COUNT
                ),
                "received_pages": (
                    page_count
                ),
            },
        )


def validate_pdf_content(
    file_bytes: bytes,
) -> None:
    try:
        document = fitz.open(
            stream=file_bytes,
            filetype="pdf",
        )

    except Exception as exc:
        raise PDFProcessingException(
            message=(
                "Failed to inspect PDF content"
            ),
        ) from exc

    extracted_text = []

    try:
        for page in document:
            page_text = (
                page.get_text(
                    "text",
                )
                .strip()
            )

            if page_text:
                extracted_text.append(
                    page_text,
                )

    finally:
        document.close()

    combined_text = "\n".join(
        extracted_text,
    ).strip()

    if not combined_text:
        raise PDFProcessingException(
            message=(
                "PDF contains no readable text"
            ),
        )
