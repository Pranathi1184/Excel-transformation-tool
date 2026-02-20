"""Tests for API endpoints (health, validate-pipeline, preview-transform)."""
import io
import pytest
import pandas as pd
from pathlib import Path
from fastapi.testclient import TestClient

from app.main import app
from app.api.v1.excel import file_storage, UPLOAD_DIR

client = TestClient(app)


def _make_excel_bytes() -> bytes:
    """Create a minimal .xlsx in memory."""
    df = pd.DataFrame({"A": [1, 2], "B": [3, 4]})
    buf = io.BytesIO()
    df.to_excel(buf, index=False, engine="openpyxl")
    buf.seek(0)
    return buf.getvalue()


@pytest.fixture(autouse=True)
def clear_file_storage():
    """Clear in-memory file storage before each test."""
    file_storage.clear()
    yield
    file_storage.clear()


class TestHealth:
    def test_health_returns_200(self):
        r = client.get("/api/v1/health")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") in ("ok", "healthy")


class TestUploadAndPreview:
    def test_upload_excel_returns_file_id(self):
        r = client.post(
            "/api/v1/upload-excel",
            files={"file": ("test.xlsx", _make_excel_bytes(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        )
        assert r.status_code == 200
        data = r.json()
        assert "fileId" in data
        assert data["fileName"] == "test.xlsx"
        assert "Sheet1" in data["sheets"]

    def test_preview_sheet_after_upload(self):
        upload = client.post(
            "/api/v1/upload-excel",
            files={"file": ("test.xlsx", _make_excel_bytes(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        )
        assert upload.status_code == 200
        file_id = upload.json()["fileId"]
        r = client.get("/api/v1/preview-sheet", params={"fileId": file_id, "sheetName": "Sheet1", "limit": 10})
        assert r.status_code == 200
        data = r.json()
        assert "columns" in data
        assert "rows" in data
        assert "A" in data["columns"] and "B" in data["columns"]


class TestValidatePipeline:
    def test_validate_pipeline_missing_file_returns_400(self):
        r = client.post(
            "/api/v1/validate-pipeline",
            json={
                "fileId": "nonexistent",
                "sheetName": "Sheet1",
                "operations": [],
            },
        )
        assert r.status_code in (400, 404)

    def test_validate_pipeline_valid_ops(self):
        upload = client.post(
            "/api/v1/upload-excel",
            files={"file": ("test.xlsx", _make_excel_bytes(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        )
        assert upload.status_code == 200
        file_id = upload.json()["fileId"]
        r = client.post(
            "/api/v1/validate-pipeline",
            json={
                "fileId": file_id,
                "sheetName": "Sheet1",
                "operations": [
                    {"type": "filter", "params": {"column": "A", "operator": "equals", "value": 1}},
                ],
            },
        )
        assert r.status_code == 200
        data = r.json()
        assert "ok" in data
        assert data["ok"] is True
        assert data["errors"] == []

    def test_validate_pipeline_invalid_column_returns_errors(self):
        upload = client.post(
            "/api/v1/upload-excel",
            files={"file": ("test.xlsx", _make_excel_bytes(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        )
        assert upload.status_code == 200
        file_id = upload.json()["fileId"]
        r = client.post(
            "/api/v1/validate-pipeline",
            json={
                "fileId": file_id,
                "sheetName": "Sheet1",
                "operations": [
                    {"type": "filter", "params": {"column": "NonExistent", "operator": "equals", "value": 1}},
                ],
            },
        )
        assert r.status_code == 200
        data = r.json()
        assert data["ok"] is False
        assert len(data["errors"]) >= 1


class TestPreviewTransform:
    def test_preview_transform_returns_transformed_data(self):
        upload = client.post(
            "/api/v1/upload-excel",
            files={"file": ("test.xlsx", _make_excel_bytes(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        )
        assert upload.status_code == 200
        file_id = upload.json()["fileId"]
        r = client.post(
            "/api/v1/preview-transform",
            json={
                "fileId": file_id,
                "sheetName": "Sheet1",
                "operations": [
                    {"type": "filter", "params": {"column": "A", "operator": "equals", "value": 1}},
                ],
            },
        )
        assert r.status_code == 200
        data = r.json()
        assert "columns" in data
        assert "rows" in data
        assert data["rowCountBefore"] >= 1
        assert data["rowCountAfter"] >= 0
