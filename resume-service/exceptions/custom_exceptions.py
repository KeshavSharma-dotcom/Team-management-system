from __future__ import annotations

from collections.abc import Mapping
from typing import Any


class ResumeCheckerException(Exception):
    """Base exception for predictable service failures.

    Application code should raise subclasses of this exception for all
    expected validation, parsing, external service, and capacity failures.
    The exception handler can safely serialize these fields without exposing
    raw files, resume text, credentials, or stack traces.
    """

    default_message = "An unexpected error occurred"
    default_status_code = 500
    default_error_code = "internal_server_error"

    def __init__(
        self,
        message: str | None = None,
        status_code: int | None = None,
        error_code: str | None = None,
        details: Mapping[str, Any] | None = None,
    ) -> None:
        self.message = self._normalize_message(
            message,
        )
        self.status_code = self._normalize_status_code(
            status_code,
        )
        self.error_code = self._normalize_error_code(
            error_code,
        )
        self.details = self._normalize_details(
            details,
        )

        super().__init__(self.message)

    @classmethod
    def _normalize_message(
        cls,
        message: str | None,
    ) -> str:
        if message is None:
            return cls.default_message

        normalized = str(message).strip()

        return normalized or cls.default_message

    @classmethod
    def _normalize_status_code(
        cls,
        status_code: int | None,
    ) -> int:
        selected_status_code = (
            status_code
            if status_code is not None
            else cls.default_status_code
        )

        if not 100 <= selected_status_code <= 599:
            return cls.default_status_code

        return selected_status_code

    @classmethod
    def _normalize_error_code(
        cls,
        error_code: str | None,
    ) -> str:
        selected_error_code = (
            error_code
            if error_code is not None
            else cls.default_error_code
        )

        normalized = str(selected_error_code).strip().lower()

        return normalized or cls.default_error_code

    @staticmethod
    def _normalize_details(
        details: Mapping[str, Any] | None,
    ) -> dict[str, Any]:
        if not details:
            return {}

        return dict(details)

    def to_error_payload(
        self,
        request_id: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "success": False,
            "error": {
                "code": self.error_code,
                "message": self.message,
                "details": self.details,
            },
        }

        if request_id:
            payload["request_id"] = request_id

        return payload


class ValidationException(ResumeCheckerException):
    default_message = "Validation failed"
    default_status_code = 400
    default_error_code = "validation_error"


class FileValidationException(ValidationException):
    default_message = "Invalid uploaded file"
    default_error_code = "file_validation_error"


class MissingFileException(FileValidationException):
    default_message = "No file was uploaded"
    default_error_code = "missing_file"


class EmptyFileException(FileValidationException):
    default_message = "Uploaded file is empty"
    default_error_code = "empty_file"


class FileTooLargeException(FileValidationException):
    default_message = "Uploaded file exceeds allowed size"
    default_status_code = 413
    default_error_code = "file_too_large"


class UnsupportedFileTypeException(FileValidationException):
    default_message = "Unsupported file type"
    default_status_code = 415
    default_error_code = "unsupported_file_type"


class PDFProcessingException(ResumeCheckerException):
    default_message = "PDF processing failed"
    default_status_code = 422
    default_error_code = "pdf_processing_error"


class InvalidPDFSignatureException(PDFProcessingException):
    default_message = "Uploaded file is not a valid PDF"
    default_status_code = 415
    default_error_code = "invalid_pdf_signature"


class CorruptPDFException(PDFProcessingException):
    default_message = "PDF is corrupt or malformed"
    default_error_code = "corrupt_pdf"


class EncryptedPDFException(PDFProcessingException):
    default_message = "Password-protected PDFs are not supported"
    default_error_code = "encrypted_pdf"


class PDFPageLimitException(PDFProcessingException):
    default_message = "PDF exceeds maximum page limit"
    default_status_code = 413
    default_error_code = "pdf_page_limit_exceeded"


class PDFTextExtractionException(PDFProcessingException):
    default_message = "Unable to extract readable text from PDF"
    default_error_code = "pdf_text_extraction_failed"


class PDFTimeoutException(PDFProcessingException):
    default_message = "PDF processing timed out"
    default_status_code = 503
    default_error_code = "pdf_processing_timeout"


class ParsingException(ResumeCheckerException):
    default_message = "Resume parsing failed"
    default_status_code = 422
    default_error_code = "parsing_error"


class ATSScoringException(ResumeCheckerException):
    default_message = "ATS scoring failed"
    default_status_code = 422
    default_error_code = "ats_scoring_error"


class KeywordAnalysisException(ResumeCheckerException):
    default_message = "Keyword analysis failed"
    default_status_code = 422
    default_error_code = "keyword_analysis_error"


class RecruiterAnalysisException(ResumeCheckerException):
    default_message = "Recruiter analysis failed"
    default_status_code = 422
    default_error_code = "recruiter_analysis_error"


class FormattingAuditException(ResumeCheckerException):
    default_message = "Formatting audit failed"
    default_status_code = 422
    default_error_code = "formatting_audit_error"


class AIServiceException(ResumeCheckerException):
    default_message = "AI service request failed"
    default_status_code = 503
    default_error_code = "ai_service_error"


class AIResponseException(ResumeCheckerException):
    default_message = "Invalid AI response"
    default_status_code = 502
    default_error_code = "ai_response_error"


class AuthenticationException(ResumeCheckerException):
    default_message = "Authentication failed"
    default_status_code = 401
    default_error_code = "authentication_error"


class AuthorizationException(ResumeCheckerException):
    default_message = "Access denied"
    default_status_code = 403
    default_error_code = "authorization_error"


class RateLimitException(ResumeCheckerException):
    default_message = "Rate limit exceeded"
    default_status_code = 429
    default_error_code = "rate_limit_exceeded"


class ResourceNotFoundException(ResumeCheckerException):
    default_message = "Requested resource not found"
    default_status_code = 404
    default_error_code = "resource_not_found"


class ServiceUnavailableException(ResumeCheckerException):
    default_message = "Service temporarily unavailable"
    default_status_code = 503
    default_error_code = "service_unavailable"


class ConfigurationException(ResumeCheckerException):
    default_message = "Application configuration error"
    default_status_code = 500
    default_error_code = "configuration_error"
