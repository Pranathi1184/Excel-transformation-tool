"""Tests for transform_engine: apply/validate operations."""
import pytest
import pandas as pd

from app.transform_engine import (
    apply_filter,
    apply_replace,
    apply_math,
    apply_sort,
    apply_select_columns,
    apply_remove_duplicates,
    apply_text_cleanup,
    apply_remove_blank_rows,
    apply_operations,
    validate_operations,
    validate_column_exists,
    ColumnNotFoundError,
    OperationValidationError,
)
from app.models.operations import FilterOperation, ReplaceOperation, MathOperation


class TestValidateColumnExists:
    def test_column_exists(self, sample_df):
        validate_column_exists(sample_df, "Name")
        validate_column_exists(sample_df, "Age")

    def test_column_not_found_raises(self, sample_df):
        with pytest.raises(ColumnNotFoundError) as exc_info:
            validate_column_exists(sample_df, "MissingCol")
        assert exc_info.value.column_name == "MissingCol"
        assert "Name" in exc_info.value.available_columns


class TestApplyFilter:
    def test_equals(self, sample_df, filter_op_equals):
        result = apply_filter(sample_df, filter_op_equals.params)
        assert len(result) == 2
        assert (result["Age"] == 25).all()

    def test_greater_than(self, sample_df, filter_op_greater_than):
        result = apply_filter(sample_df, filter_op_greater_than.params)
        assert len(result) == 2
        assert (result["Age"] > 30).all()

    def test_contains(self, sample_df):
        op = FilterOperation(params={
            "column": "Name",
            "operator": "contains",
            "value": "Alice",
        })
        result = apply_filter(sample_df, op.params)
        assert len(result) == 2  # Alice x2
        assert all("Alice" in str(n) for n in result["Name"])


class TestApplyReplace:
    def test_replace_string(self, sample_df, replace_op):
        result = apply_replace(sample_df, replace_op.params)
        assert (result["Status"] == "A").sum() == 4
        assert (result["Status"] == "Inactive").sum() == 1


class TestApplyMath:
    def test_add_columns(self, sample_df, math_op_add):
        result = apply_math(sample_df, math_op_add.params)
        assert "Total" in result.columns
        assert result["Total"].tolist() == [105, 120, 120, 105, 135]


class TestApplySort:
    def test_sort_ascending(self, sample_df, sort_op):
        result = apply_sort(sample_df, sort_op.params)
        assert result["Age"].tolist() == [25, 25, 30, 35, 40]


class TestApplySelectColumns:
    def test_select_columns(self, sample_df, select_columns_op):
        result = apply_select_columns(sample_df, select_columns_op.params)
        assert list(result.columns) == ["Name", "Age"]
        assert len(result) == len(sample_df)


class TestApplyRemoveDuplicates:
    def test_remove_duplicates_by_subset(self, sample_df, remove_duplicates_op):
        result = apply_remove_duplicates(sample_df, remove_duplicates_op.params)
        assert len(result) == 4  # Alice appears twice, one removed


class TestApplyTextCleanup:
    def test_trim(self, sample_df, text_cleanup_op):
        df = sample_df.copy()
        df.loc[0, "Name"] = "  Alice  "
        result = apply_text_cleanup(df, text_cleanup_op.params)
        assert result.loc[0, "Name"] == "Alice"


class TestApplyRemoveBlankRows:
    def test_remove_blank_rows_with_columns(self, sample_df, remove_blank_rows_op):
        df = sample_df.copy()
        df.loc[2, "Name"] = None
        result = apply_remove_blank_rows(df, remove_blank_rows_op.params)
        assert len(result) == 4


class TestValidateOperations:
    def test_valid_pipeline_empty_errors(self, sample_df, filter_op_equals):
        errors = validate_operations(sample_df, [filter_op_equals])
        assert errors == []

    def test_invalid_column_returns_error(self, sample_df):
        op = FilterOperation(params={
            "column": "NonExistent",
            "operator": "equals",
            "value": 1,
        })
        errors = validate_operations(sample_df, [op])
        assert len(errors) == 1
        assert "NonExistent" in errors[0]["message"]


class TestApplyOperations:
    def test_pipeline_filter_then_replace(self, sample_df, filter_op_equals, replace_op):
        result = apply_operations(sample_df, [filter_op_equals, replace_op])
        assert len(result) == 2
        assert (result["Status"] == "A").all()

    def test_pipeline_unknown_type_raises(self, sample_df):
        class FakeOp:
            type = "fake"
            params = {}
        with pytest.raises(OperationValidationError) as exc_info:
            apply_operations(sample_df, [FakeOp()])
        assert "Unknown operation type" in exc_info.value.message
