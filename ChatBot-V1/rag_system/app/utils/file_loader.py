"""
Multi-format document loader with OCR support for scanned PDFs
Supports: txt, pdf (including scanned/image PDFs), docx, csv, xlsx, json
"""

import json
from pathlib import Path
from typing import List, Dict, Any
import pandas as pd
from pypdf import PdfReader
from docx import Document
from .logger import log

# OCR imports (optional - will fallback if not available)
try:
    from pdf2image import convert_from_path
    import pytesseract
    import platform
    
    # Configure Tesseract path for Windows
    if platform.system() == 'Windows':
        pytesseract.pytesseract.tesseract_cmd = r'C:\Users\kuppubalaji Gs\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'
    
    OCR_AVAILABLE = True
    log.info("✓ OCR support enabled (pytesseract + pdf2image)")
except ImportError:
    OCR_AVAILABLE = False
    log.warning("OCR libraries not installed. Scanned PDFs won't be processed.")

class DocumentLoader:
    """Load and extract text from various document formats with OCR support"""
    
    @staticmethod
    def load_txt(file_path: Path) -> str:
        """Load plain text file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except Exception as e:
            log.error(f"Error loading TXT {file_path}: {e}")
            return ""
    
    @staticmethod
    def load_pdf(file_path: Path) -> str:
        """
        Extract text from PDF with OCR fallback for scanned documents
        
        Strategy:
        1. Try normal text extraction first
        2. If very little text found, assume it's scanned and use OCR
        3. OCR each page as an image and extract text
        """
        try:
            # Step 1: Try normal PDF text extraction
            reader = PdfReader(str(file_path))
            text_parts = []
            
            for page_num, page in enumerate(reader.pages):
                extracted = page.extract_text()
                if extracted:
                    text_parts.append(extracted)
            
            pdf_text = "\n\n".join(text_parts)
            
            # Step 2: Check if we got meaningful text
            # If less than 500 characters from entire PDF, it's likely scanned
            if len(pdf_text.strip()) < 500:
                log.warning(f"PDF appears to be scanned (only {len(pdf_text)} chars). Attempting OCR...")
                
                if not OCR_AVAILABLE:
                    log.error("OCR libraries not installed. Cannot process scanned PDF.")
                    log.error("Install with: pip install pytesseract pdf2image pillow")
                    return pdf_text  # Return whatever we got
                
                # Step 3: Perform OCR on the PDF
                ocr_text = DocumentLoader._ocr_pdf(file_path)
                
                if len(ocr_text) > len(pdf_text):
                    log.info(f"OCR successful: Extracted {len(ocr_text)} characters")
                    return ocr_text
                else:
                    log.warning("OCR didn't find more text than normal extraction")
                    return pdf_text
            
            log.info(f"Extracted {len(pdf_text)} characters from PDF (normal extraction)")
            return pdf_text
            
        except Exception as e:
            log.error(f"Error loading PDF {file_path}: {e}")
            return ""
    
    @staticmethod
    def _ocr_pdf(file_path: Path) -> str:
        """
        Perform OCR on a PDF file
        Converts each page to an image and extracts text
        """
        try:
            log.info(f"Starting OCR on {file_path.name}...")
            
            # Convert PDF pages to images
            # dpi=300 gives good quality, use 200 for faster processing
            images = convert_from_path(
                str(file_path),
                dpi=300,
                fmt='jpeg'
            )
            
            log.info(f"PDF has {len(images)} page(s). Processing...")
            
            ocr_results = []
            for i, image in enumerate(images, 1):
                log.info(f"OCR processing page {i}/{len(images)}...")
                
                # Perform OCR on the image
                # lang='eng' for English, use 'hin' for Hindi, etc.
                page_text = pytesseract.image_to_string(
                    image,
                    lang='eng',
                    config='--psm 6'  # Assume uniform text block
                )
                
                if page_text.strip():
                    ocr_results.append(f"--- Page {i} ---\n{page_text}")
                    log.info(f"Page {i}: Extracted {len(page_text)} characters")
                else:
                    log.warning(f"Page {i}: No text found")
            
            full_text = "\n\n".join(ocr_results)
            log.info(f"OCR complete: Total {len(full_text)} characters from {len(images)} pages")
            
            return full_text
            
        except Exception as e:
            log.error(f"OCR failed for {file_path}: {e}")
            return ""
    
    @staticmethod
    def load_docx(file_path: Path) -> str:
        """Extract text from DOCX"""
        try:
            doc = Document(str(file_path))
            paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
            return "\n\n".join(paragraphs)
        except Exception as e:
            log.error(f"Error loading DOCX {file_path}: {e}")
            return ""
    
    @staticmethod
    def load_csv(file_path: Path) -> str:
        """Load CSV as text"""
        try:
            df = pd.read_csv(file_path)
            return df.to_string(index=False)
        except Exception as e:
            log.error(f"Error loading CSV {file_path}: {e}")
            return ""
    
    @staticmethod
    def load_xlsx(file_path: Path) -> str:
        """Load Excel file as text"""
        try:
            df = pd.read_excel(file_path, sheet_name=None)
            text_parts = []
            for sheet_name, sheet_df in df.items():
                text_parts.append(f"Sheet: {sheet_name}\n{sheet_df.to_string(index=False)}")
            return "\n\n".join(text_parts)
        except Exception as e:
            log.error(f"Error loading XLSX {file_path}: {e}")
            return ""
    
    @staticmethod
    def load_json(file_path: Path) -> str:
        """Load JSON and convert to text"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return json.dumps(data, indent=2)
        except Exception as e:
            log.error(f"Error loading JSON {file_path}: {e}")
            return ""
    
    @classmethod
    def load_document(cls, file_path: Path) -> Dict[str, Any]:
        """Load document based on file extension"""
        extension = file_path.suffix.lower()
        
        loaders = {
            '.txt': cls.load_txt,
            '.pdf': cls.load_pdf,
            '.docx': cls.load_docx,
            '.doc': cls.load_docx,
            '.csv': cls.load_csv,
            '.xlsx': cls.load_xlsx,
            '.xls': cls.load_xlsx,
            '.json': cls.load_json
        }
        
        loader = loaders.get(extension)
        if not loader:
            log.warning(f"Unsupported file type: {extension}")
            return {'path': str(file_path), 'content': '', 'error': 'Unsupported format'}
        
        log.info(f"Loading document: {file_path.name}")
        content = loader(file_path)
        
        return {
            'path': str(file_path),
            'name': file_path.name,
            'extension': extension,
            'content': content,
            'char_count': len(content)
        }
    
    @classmethod
    def load_directory(cls, directory: Path) -> List[Dict[str, Any]]:
        """Load all supported documents from a directory"""
        documents = []
        supported_extensions = {'.txt', '.pdf', '.docx', '.doc', '.csv', '.xlsx', '.xls', '.json'}
        
        for file_path in directory.rglob('*'):
            if file_path.is_file() and file_path.suffix.lower() in supported_extensions:
                doc = cls.load_document(file_path)
                if doc['content']:
                    documents.append(doc)
        
        log.info(f"Loaded {len(documents)} documents from {directory}")
        return documents


# ============================================================================
# COMPATIBILITY FUNCTION - For existing routes.py
# ============================================================================

def load_file(file_path):
    """
    Load a single file and return its content
    
    This is a wrapper function for compatibility with existing code.
    Uses DocumentLoader class internally.
    
    Args:
        file_path: Path to the file (string or Path object)
        
    Returns:
        dict: {'content': str, 'metadata': dict} or None if failed
    """
    try:
        # Convert to Path object if string
        if isinstance(file_path, str):
            file_path = Path(file_path)
        
        # Use DocumentLoader to load the file
        loader = DocumentLoader()
        doc = loader.load_document(file_path)
        
        if doc and doc.get('content'):
            return {
                'content': doc['content'],
                'metadata': {
                    'filename': doc.get('name', ''),
                    'path': doc.get('path', ''),
                    'extension': doc.get('extension', ''),
                    'char_count': doc.get('char_count', 0)
                }
            }
        else:
            log.error(f"Failed to load file: {file_path}")
            return None
            
    except Exception as e:
        log.error(f"Error in load_file: {e}")
        return None


# Export both the class and the function
__all__ = ['DocumentLoader', 'load_file']