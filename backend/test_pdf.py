import os
import pytest
from docx2pdf import convert

@pytest.mark.skip(reason="docx2pdf conversion requires Microsoft Word which may not be available in this environment.")
def test_docx2pdf_conversion():
    """Test conversion of a DOCX file to PDF using docx2pdf.

    The test is skipped by default because the conversion relies on COM
    automation of Microsoft Word, which is not guaranteed to be present on
    headless CI agents. If you have Word installed locally and wish to run
    this test, remove the ``@pytest.mark.skip`` decorator.
    """
    docx_path = r"c:\Users\Zuraiz Malik\Desktop\AI Resume Builder\backend\templates\test_template.docx"
    pdf_path = r"c:\Users\Zuraiz Malik\Desktop\AI Resume Builder\backend\templates\test_output.pdf"
    convert(docx_path, pdf_path)
    # If conversion succeeds, the output file should exist.
    assert os.path.exists(pdf_path)

