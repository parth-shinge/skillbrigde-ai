"""
Document parser module for SkillBridge AI.
Extracts text from PDF and plain-text files using PyMuPDF.
"""

import re
import fitz  # PyMuPDF


async def parse_document(file_bytes: bytes, filename: str) -> str:
    """Parse a document (PDF or TXT) and return cleaned text content.

    Args:
        file_bytes: Raw bytes of the uploaded file.
        filename: Original filename to determine format.

    Returns:
        Cleaned text string extracted from the document.

    Raises:
        ValueError: If the file format is unsupported or extraction fails.
    """
    filename_lower = filename.lower()

    if filename_lower.endswith(".pdf"):
        text = _extract_pdf_text(file_bytes)
    elif filename_lower.endswith(".txt"):
        text = file_bytes.decode("utf-8", errors="replace")
    else:
        raise ValueError(f"Unsupported file format: {filename}. Only PDF and TXT are accepted.")

    if not text or not text.strip():
        raise ValueError(f"No text could be extracted from {filename}")

    return _clean_text(text)


def _extract_pdf_text(file_bytes: bytes) -> str:
    """Extract all text from a PDF using PyMuPDF.

    Args:
        file_bytes: Raw PDF bytes.

    Returns:
        Concatenated text from all pages.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages = []
        for page in doc:
            page_text = page.get_text("text")
            if page_text:
                pages.append(page_text)
        doc.close()
        return "\n".join(pages)
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")


def _clean_text(text: str) -> str:
    """Clean and normalize extracted text.

    Args:
        text: Raw extracted text.

    Returns:
        Cleaned text with normalized whitespace and newlines.
    """
    # Normalize different newline formats
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Collapse multiple blank lines into two newlines
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Collapse multiple spaces/tabs into single space
    text = re.sub(r"[ \t]+", " ", text)
    # Remove leading/trailing whitespace from each line
    lines = [line.strip() for line in text.split("\n")]
    text = "\n".join(lines)
    # Strip overall
    return text.strip()
