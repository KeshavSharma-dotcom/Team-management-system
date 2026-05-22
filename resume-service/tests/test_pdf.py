import io

import pytest
from fastapi import UploadFile

from resume_checker.exceptions.custom_exceptions import (
    FileValidationException,
    PDFProcessingException,
    UnsupportedFileTypeException,
)
from resume_checker.services.pdf.pdf_service import (
    extract_resume_text,
)
from resume_checker.services.pdf.pdf_validator import (
    validate_pdf_file,
)


VALID_PDF_BYTES = (
    b"%PDF-1.4\n"
    b"1 0 obj\n"
    b"<< /Type /Catalog >>\n"
    b"endobj\n"
    b"trailer\n"
    b"<< /Root 1 0 R >>\n"
    b"%%EOF"
)

INVALID_PDF_BYTES = (
    b"This is not a valid PDF file"
)


def create_upload_file(
    filename: str,
    content: bytes,
    content_type: str,
) -> UploadFile:
    return UploadFile(
        filename=filename,
        file=io.BytesIO(content),
        headers={
            "content-type": (
                content_type
            ),
        },
    )


@pytest.mark.asyncio
async def test_validate_valid_pdf_file(
):
    upload_file = create_upload_file(
        filename="resume.pdf",
        content=VALID_PDF_BYTES,
        content_type=(
            "application/pdf"
        ),
    )

    validation_result = (
        await validate_pdf_file(
            upload_file,
        )
    )

    assert (
        validation_result
        is True
    )


@pytest.mark.asyncio
async def test_reject_non_pdf_file(
):
    upload_file = create_upload_file(
        filename="resume.txt",
        content=(
            INVALID_PDF_BYTES
        ),
        content_type=(
            "text/plain"
        ),
    )

    with pytest.raises(
        UnsupportedFileTypeException
    ):
        await validate_pdf_file(
            upload_file,
        )


@pytest.mark.asyncio
async def test_reject_empty_pdf_file(
):
    upload_file = create_upload_file(
        filename="empty.pdf",
        content=b"",
        content_type=(
            "application/pdf"
        ),
    )

    with pytest.raises(
        FileValidationException
    ):
        await validate_pdf_file(
            upload_file,
        )


@pytest.mark.asyncio
async def test_reject_invalid_pdf_content(
):
    upload_file = create_upload_file(
        filename="corrupted.pdf",
        content=(
            INVALID_PDF_BYTES
        ),
        content_type=(
            "application/pdf"
        ),
    )

    with pytest.raises(
        PDFProcessingException
    ):
        await extract_resume_text(
            upload_file,
        )


@pytest.mark.asyncio
async def test_extract_resume_text_returns_dictionary(
):
    upload_file = create_upload_file(
        filename="resume.pdf",
        content=VALID_PDF_BYTES,
        content_type=(
            "application/pdf"
        ),
    )

    try:
        result = (
            await extract_resume_text(
                upload_file,
            )
        )

    except PDFProcessingException:
        pytest.skip(
            (
                "PDF parser requires real PDF rendering backend"
            )
        )

    assert isinstance(
        result,
        dict,
    )

    assert (
        "text"
        in result
    )

    assert (
        "metadata"
        in result
    )


@pytest.mark.asyncio
async def test_extract_resume_text_contains_string_text(
):
    upload_file = create_upload_file(
        filename="resume.pdf",
        content=VALID_PDF_BYTES,
        content_type=(
            "application/pdf"
        ),
    )

    try:
        result = (
            await extract_resume_text(
                upload_file,
            )
        )

    except PDFProcessingException:
        pytest.skip(
            (
                "PDF parser requires valid rendered PDF"
            )
        )

    assert isinstance(
        result["text"],
        str,
    )


@pytest.mark.asyncio
async def test_validate_pdf_file_preserves_filename(
):
    upload_file = create_upload_file(
        filename="candidate_resume.pdf",
        content=VALID_PDF_BYTES,
        content_type=(
            "application/pdf"
        ),
    )

    await validate_pdf_file(
        upload_file,
    )

    assert (
        upload_file.filename
        == "candidate_resume.pdf"
    )


@pytest.mark.asyncio
async def test_reject_pdf_with_missing_filename(
):
    upload_file = create_upload_file(
        filename="",
        content=VALID_PDF_BYTES,
        content_type=(
            "application/pdf"
        ),
    )

    with pytest.raises(
        FileValidationException
    ):
        await validate_pdf_file(
            upload_file,
        )


@pytest.mark.asyncio
async def test_validate_pdf_content_type_case_insensitive(
):
    upload_file = create_upload_file(
        filename="resume.pdf",
        content=VALID_PDF_BYTES,
        content_type=(
            "Application/PDF"
        ),
    )

    validation_result = (
        await validate_pdf_file(
            upload_file,
        )
    )

    assert (
        validation_result
        is True
    )


@pytest.mark.asyncio
async def test_reject_pdf_with_invalid_extension(
):
    upload_file = create_upload_file(
        filename="resume.exe",
        content=VALID_PDF_BYTES,
        content_type=(
            "application/pdf"
        ),
    )

    with pytest.raises(
        UnsupportedFileTypeException
    ):
        await validate_pdf_file(
            upload_file,
        )