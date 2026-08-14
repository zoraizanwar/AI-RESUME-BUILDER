import io
import pypdf
import docx

def extract_text_from_pdf(file_stream: bytes) -> str:
    """Extracts raw text from a PDF byte stream."""
    try:
        pdf_reader = pypdf.PdfReader(io.BytesIO(file_stream))
        text = ""
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")

def extract_text_from_docx(file_stream: bytes) -> str:
    """Extracts raw text from a DOCX byte stream."""
    try:
        doc = docx.Document(io.BytesIO(file_stream))
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        raise ValueError(f"Failed to extract text from DOCX: {str(e)}")
