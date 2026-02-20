"""
Core Excel file upload and preview endpoints for Phase 1.
"""
import os
import uuid
import shutil
import logging
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, Any, List, Optional, Literal
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse
import pandas as pd
import openpyxl

from app.utils.excel_loader import load_excel_with_header_detection

logger = logging.getLogger(__name__)

router = APIRouter()

# Directory to store uploaded files
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Directory to store transformed files
OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

# In-memory storage for file metadata (fileId -> file info)
file_storage: Dict[str, Dict[str, Any]] = {}


def _get_sheet_names_fast(file_path: Path) -> List[str]:
    """
    Get sheet names from Excel file quickly by reading XML directly.
    This is MUCH faster than loading the entire workbook with openpyxl.
    
    Args:
        file_path: Path to the .xlsx file
        
    Returns:
        List of sheet names
    """
    # .xlsx files are ZIP archives - read directly from ZIP
    try:
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            # Read workbook.xml (tiny file, ~1KB)
            workbook_xml = zip_ref.read('xl/workbook.xml')
            
            # Parse XML
            root = ET.fromstring(workbook_xml)
            
            # Excel 2007+ namespace
            ns = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
            
            # Find all sheet elements
            sheets = root.findall(f'.//{ns}sheet')
            
            # If no sheets found with namespace, try alternative methods
            if not sheets:
                # Try without namespace
                sheets = root.findall('.//sheet')
            
            # If still no sheets, try iterating through all elements
            if not sheets:
                for elem in root.iter():
                    if 'sheet' in elem.tag.lower() and elem.get('name'):
                        sheets.append(elem)
            
            # Extract sheet names
            sheet_names = [sheet.get('name') for sheet in sheets if sheet.get('name')]
            
            if sheet_names:
                return sheet_names
            
            # If still no sheets, something is wrong - use fallback
            raise ValueError("No sheets found in XML")
            
    except (zipfile.BadZipFile, KeyError) as e:
        # Invalid ZIP file or missing workbook.xml
        raise ValueError(f"Invalid Excel file: {str(e)}")
    except (ET.ParseError, ValueError) as e:
        # XML parsing failed - fallback to openpyxl
        # This is slower but more reliable for edge cases
        logger.info(f"XML parsing failed, using openpyxl fallback: {e}")
        try:
            workbook = openpyxl.load_workbook(
                file_path, 
                read_only=True,
                data_only=False,
                keep_links=False,
                rich_text=False
            )
            sheet_names = workbook.sheetnames
            workbook.close()
            return sheet_names
        except Exception as openpyxl_error:
            raise ValueError(f"Could not read Excel file: {str(openpyxl_error)}")
    except Exception as e:
        # Any other unexpected error
        logger.error(f"Unexpected error reading Excel file: {e}", exc_info=True)
        raise ValueError(f"Error reading Excel file: {str(e)}")


def _rebuild_file_storage_from_disk():
    """
    Rebuild file_storage dictionary from files on disk.
    This helps recover file metadata after server restart.
    """
    if not UPLOAD_DIR.exists():
        return
    
    for file_path in UPLOAD_DIR.glob("*.xlsx"):
        try:
            # Extract file_id from filename (format: {file_id}.xlsx)
            file_id = file_path.stem
            
            # Skip if already in storage
            if file_id in file_storage:
                continue
            
            # Read sheet names quickly
            sheet_names = _get_sheet_names_fast(file_path)
            
            # Rebuild metadata
            file_storage[file_id] = {
                "file_id": file_id,
                "filename": f"recovered_{file_id}.xlsx",  # We don't know original name
                "file_path": str(file_path),
                "sheets": sheet_names,
            }
        except Exception as e:
            # Skip files that can't be read
            logger.warning(f"Could not rebuild metadata for {file_path}: {e}")
            continue


def _get_file_info(file_id: str) -> Dict[str, Any]:
    """
    Get file info, checking both in-memory storage and disk.
    Raises HTTPException if file not found.
    """
    # First check in-memory storage
    if file_id in file_storage:
        file_info = file_storage[file_id]
        file_path = Path(file_info["file_path"])
        # Verify file still exists on disk
        if file_path.exists():
            return file_info
        else:
            # File on disk was deleted, remove from storage
            del file_storage[file_id]
    
    # Not in memory, check if file exists on disk
    file_path = UPLOAD_DIR / f"{file_id}.xlsx"
    if file_path.exists():
        try:
            # Rebuild metadata from disk using fast method
            sheet_names = _get_sheet_names_fast(file_path)
            
            file_info = {
                "file_id": file_id,
                "filename": f"recovered_{file_id}.xlsx",
                "file_path": str(file_path),
                "sheets": sheet_names,
            }
            # Store in memory for future use
            file_storage[file_id] = file_info
            return file_info
        except Exception as e:
            logger.error(f"Error reading file {file_id} from disk: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Error reading file from disk: {str(e)}"
            )
    
    # File not found
    raise HTTPException(
        status_code=404,
        detail=f"File with ID '{file_id}' not found. Please upload the file first."
    )


@router.post("/upload-excel")
async def upload_excel(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload an Excel file and return file ID and sheet names.
    
    Args:
        file: Excel file (.xlsx)
    
    Returns:
        {
            "fileId": str,
            "fileName": str,
            "sheets": List[str]
        }
    """
    return await _process_single_file(file)


async def _process_single_file(file: UploadFile) -> Dict[str, Any]:
    """
    Process a single file upload - OPTIMIZED FOR SPEED.
    """
    # Quick validation
    if not file.filename or not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Invalid file. Only .xlsx files supported.")
    
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}.xlsx"
    
    try:
        # Step 1: Save file (instant for 11KB)
        file_content = await file.read()
        file_path.write_bytes(file_content)
        
        # Step 2: Get sheet names (should be < 10ms with XML, < 500ms with openpyxl fallback)
        sheet_names = _get_sheet_names_fast(file_path)
        
        # Step 3: Store metadata
        file_storage[file_id] = {
            "file_id": file_id,
            "filename": file.filename,
            "file_path": str(file_path),
            "sheets": sheet_names,
        }
        
        return {
            "fileId": file_id,
            "fileName": file.filename,
            "sheets": sheet_names,
        }
    except HTTPException:
        raise
    except ValueError as e:
        # Clean up on validation error
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Clean up on any other error
        if file_path.exists():
            file_path.unlink()
        logger.error(f"Upload error for {file.filename}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/upload-multiple-excel")
async def upload_multiple_excel(files: List[UploadFile] = File(...)) -> Dict[str, Any]:
    """
    Upload multiple Excel files and return file IDs and sheet names.
    
    Args:
        files: List of Excel files (.xlsx)
    
    Returns:
        {
            "files": [
                {
                    "fileId": str,
                    "fileName": str,
                    "sheets": List[str]
                },
                ...
            ],
            "errors": Optional[List[Dict]]  # If some files failed
        }
    """
    if not files or len(files) == 0:
        raise HTTPException(
            status_code=400,
            detail="No files provided"
        )
    
    if len(files) == 1:
        # Single file, use existing endpoint logic
        result = await _process_single_file(files[0])
        return {"files": [result]}
    
    uploaded_files = []
    errors = []
    
    for idx, file in enumerate(files):
        try:
            result = await _process_single_file(file)
            uploaded_files.append(result)
        except HTTPException as e:
            errors.append({
                "fileName": file.filename or f"File {idx + 1}",
                "error": e.detail if isinstance(e.detail, str) else str(e.detail)
            })
        except Exception as e:
            errors.append({
                "fileName": file.filename or f"File {idx + 1}",
                "error": f"Unexpected error: {str(e)}"
            })
    
    if not uploaded_files:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to upload any files. Errors: {errors}"
        )
    
    response: Dict[str, Any] = {"files": uploaded_files}
    if errors:
        response["errors"] = errors
    
    return response


@router.get("/preview-sheet")
async def preview_sheet(
    fileId: str = Query(..., description="File ID from upload"),
    sheetName: str = Query(..., description="Name of the sheet to preview"),
    limit: int = Query(10, ge=1, le=50, description="Number of rows to return"),
    headerRowIndex: Optional[int] = Query(None, description="Optional explicit header row index (0-based). If not provided, auto-detect.")
) -> Dict[str, Any]:
    """
    Preview first N rows of a specific sheet with automatic header detection.
    
    Args:
        fileId: File ID from upload endpoint
        sheetName: Name of the sheet to preview
        limit: Number of rows to return (default: 10, max: 50)
        headerRowIndex: Optional explicit header row index (0-based). If None, auto-detect.
    
    Returns:
        {
            "fileId": str,
            "sheetName": str,
            "columns": List[str],
            "rows": List[Dict[str, Any]],
            "headerRowIndex": int,
            "warning": Optional[str]
        }
    """
    # Get file info (checks both memory and disk)
    try:
        file_info = _get_file_info(fileId)
    except HTTPException as e:
        # Re-raise HTTP exceptions (404, 500 from _get_file_info)
        raise e
    except Exception as e:
        # Catch any other unexpected errors
        logger.error(f"Unexpected error getting file info for {fileId}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error accessing file: {str(e)}"
        )
    
    file_path = Path(file_info["file_path"])
    
    # Validate sheet name
    if sheetName not in file_info["sheets"]:
        available_sheets = ", ".join(file_info["sheets"])
        raise HTTPException(
            status_code=400,
            detail=f"Sheet '{sheetName}' not found. Available sheets: {available_sheets}"
        )
    
    try:
        # Load Excel with header detection
        df, detected_header_row, warning = load_excel_with_header_detection(
            file_path,
            sheet_name=sheetName,
            header_row_index=headerRowIndex,
            nrows=limit
        )
        
        logger.info(f"Preview request: fileId={fileId}, sheetName={sheetName}, limit={limit}, rows={len(df)}, columns={len(df.columns)}")
        
        # Convert to list of dictionaries (rows)
        rows = df.fillna("").to_dict(orient='records')
        
        # Get column names
        columns = [str(col) for col in df.columns]
        
        response = {
            "fileId": fileId,
            "sheetName": sheetName,
            "columns": columns,
            "rows": rows,
            "headerRowIndex": detected_header_row,
        }
        
        # Add warning if present
        if warning:
            response["warning"] = warning
        
        return response
    except ValueError as e:
        logger.error(f"ValueError reading sheet {sheetName} from file {fileId}: {e}")
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error reading sheet {sheetName} from file {fileId}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error reading sheet: {str(e)}"
        )


@router.get("/download-transformed")
async def download_transformed(
    fileId: str = Query(..., description="File ID from upload"),
    sheetName: str = Query(..., description="Name of the sheet"),
    headerRowIndex: Optional[int] = Query(None, description="Optional header row index")
) -> Dict[str, Any]:
    """
    Download transformed file (placeholder for future implementation).
    """
    raise HTTPException(
        status_code=501,
        detail="Download functionality not yet implemented"
    )
