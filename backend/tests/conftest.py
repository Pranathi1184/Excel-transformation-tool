"""Pytest fixtures for transform engine and API tests."""
import pytest
import pandas as pd
from pathlib import Path

from app.models.operations import (
    FilterOperation,
    ReplaceOperation,
    MathOperation,
    SortOperation,
    SelectColumnsOperation,
    RemoveDuplicatesOperation,
    TextCleanupOperation,
    RemoveBlankRowsOperation,
)


@pytest.fixture
def sample_df():
    """Sample DataFrame for transformation tests."""
    return pd.DataFrame({
        "Name": ["Alice", "Bob", "Charlie", "Alice", "Eve"],
        "Age": [25, 30, 35, 25, 40],
        "Score": [80, 90, 85, 80, 95],
        "Status": ["Active", "Active", "Inactive", "Active", "Active"],
    })


@pytest.fixture
def filter_op_equals():
    """Filter operation: Age equals 25."""
    return FilterOperation(params={"column": "Age", "operator": "equals", "value": 25})


@pytest.fixture
def filter_op_greater_than():
    """Filter operation: Age greater than 30."""
    return FilterOperation(params={"column": "Age", "operator": "greater_than", "value": 30})


@pytest.fixture
def replace_op():
    """Replace operation: Status 'Active' -> 'A'."""
    return ReplaceOperation(params={
        "column": "Status",
        "oldValue": "Active",
        "newValue": "A",
    })


@pytest.fixture
def math_op_add():
    """Math operation: Age + Score -> Total."""
    return MathOperation(params={
        "operation": "add",
        "colA": "Age",
        "colBOrValue": "Score",
        "newColumn": "Total",
    })


@pytest.fixture
def sort_op():
    """Sort operation: by Age ascending."""
    return SortOperation(params={
        "columns": [{"column": "Age", "ascending": True}],
    })


@pytest.fixture
def select_columns_op():
    """Select columns: Name, Age."""
    return SelectColumnsOperation(params={"columns": ["Name", "Age"]})


@pytest.fixture
def remove_duplicates_op():
    """Remove duplicates by Name."""
    return RemoveDuplicatesOperation(params={"subset": ["Name"]})


@pytest.fixture
def text_cleanup_op():
    """Text cleanup: trim on Name."""
    return TextCleanupOperation(params={
        "column": "Name",
        "operations": ["trim"],
    })


@pytest.fixture
def remove_blank_rows_op():
    """Remove blank rows (all columns)."""
    return RemoveBlankRowsOperation(params={"columns": ["Name", "Age", "Score", "Status"]})
