"""
Pydantic models for transformation operations.
"""
import uuid
from typing import Literal, Dict, Any, Union, Optional, List
from pydantic import BaseModel, Field, field_validator


class FilterOperation(BaseModel):
    """Filter operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["filter"] = "filter"
    params: Dict[str, Any] = Field(
        ...,
        description="Filter parameters: column, operator, value"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate filter operation parameters."""
        required_keys = {'column', 'operator', 'value'}
        if not required_keys.issubset(v.keys()):
            missing = required_keys - set(v.keys())
            raise ValueError(f"Missing required keys: {missing}")
        
        valid_operators = {'equals', 'not_equals', 'greater_than', 'less_than', 
                          'greater_equal', 'less_equal', 'contains', 'not_contains', 'date_range'}
        operator = v.get('operator')
        if operator not in valid_operators:
            raise ValueError(
                f"Invalid operator '{operator}'. Must be one of: {', '.join(valid_operators)}"
            )
        
        # For date_range operator, value should be a dict with 'start' and 'end'
        if operator == 'date_range':
            value = v.get('value')
            if not isinstance(value, dict) or 'start' not in value or 'end' not in value:
                raise ValueError("For 'date_range' operator, 'value' must be a dict with 'start' and 'end' keys")
        
        return v


class ReplaceOperation(BaseModel):
    """Replace operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["replace"] = "replace"
    params: Dict[str, Any] = Field(
        ...,
        description="Replace parameters: column, oldValue, newValue"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate replace operation parameters."""
        required_keys = {'column', 'oldValue', 'newValue'}
        if not required_keys.issubset(v.keys()):
            missing = required_keys - set(v.keys())
            raise ValueError(f"Missing required keys: {missing}")
        return v


class MathOperation(BaseModel):
    """Math operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["math"] = "math"
    params: Dict[str, Any] = Field(
        ...,
        description="Math parameters: operation, colA, colBOrValue, newColumn"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate math operation parameters."""
        required_keys = {'operation', 'colA', 'colBOrValue', 'newColumn'}
        if not required_keys.issubset(v.keys()):
            missing = required_keys - set(v.keys())
            raise ValueError(f"Missing required keys: {missing}")
        
        valid_operations = {'add', 'subtract', 'multiply', 'divide'}
        operation = v.get('operation')
        if operation not in valid_operations:
            raise ValueError(
                f"Invalid operation '{operation}'. Must be one of: {', '.join(valid_operations)}"
            )
        
        return v


class SortOperation(BaseModel):
    """Sort operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["sort"] = "sort"
    params: Dict[str, Any] = Field(
        ...,
        description="Sort parameters: columns (list of {column, ascending})"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate sort operation parameters."""
        required_keys = {'columns'}
        if not required_keys.issubset(v.keys()):
            missing = required_keys - set(v.keys())
            raise ValueError(f"Missing required keys: {missing}")
        
        columns = v.get('columns', [])
        if not isinstance(columns, list) or len(columns) == 0:
            raise ValueError("'columns' must be a non-empty list")
        
        for col_config in columns:
            if not isinstance(col_config, dict):
                raise ValueError("Each column config must be a dictionary")
            if 'column' not in col_config:
                raise ValueError("Each column config must have 'column' key")
            if 'ascending' not in col_config:
                raise ValueError("Each column config must have 'ascending' key (boolean)")
        
        return v


class SelectColumnsOperation(BaseModel):
    """Select columns operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["select_columns"] = "select_columns"
    params: Dict[str, Any] = Field(
        ...,
        description="Select columns parameters: columns (list of column names)"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate select columns operation parameters."""
        required_keys = {'columns'}
        if not required_keys.issubset(v.keys()):
            missing = required_keys - set(v.keys())
            raise ValueError(f"Missing required keys: {missing}")
        
        columns = v.get('columns', [])
        if not isinstance(columns, list) or len(columns) == 0:
            raise ValueError("'columns' must be a non-empty list")
        
        return v


class RemoveDuplicatesOperation(BaseModel):
    """Remove duplicates operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["remove_duplicates"] = "remove_duplicates"
    params: Dict[str, Any] = Field(
        ...,
        description="Remove duplicates parameters: subset (optional list of columns), keep (first/last)"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate remove duplicates operation parameters."""
        # subset is optional
        if 'subset' in v and v['subset'] is not None:
            if not isinstance(v['subset'], list):
                raise ValueError("'subset' must be a list of column names")
        
        # keep is optional, defaults to 'first'
        if 'keep' in v and v['keep'] not in ['first', 'last', False]:
            raise ValueError("'keep' must be 'first', 'last', or False")
        
        return v


class AggregateOperation(BaseModel):
    """Aggregate operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["aggregate"] = "aggregate"
    params: Dict[str, Any] = Field(
        ...,
        description="Aggregate parameters: groupBy (optional), aggregations (dict of column -> operation)"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate aggregate operation parameters."""
        required_keys = {'aggregations'}
        if not required_keys.issubset(v.keys()):
            missing = required_keys - set(v.keys())
            raise ValueError(f"Missing required keys: {missing}")
        
        aggregations = v.get('aggregations', {})
        if not isinstance(aggregations, dict) or len(aggregations) == 0:
            raise ValueError("'aggregations' must be a non-empty dictionary")
        
        valid_ops = {'sum', 'mean', 'average', 'count', 'min', 'max', 'std', 'median'}
        for col, op in aggregations.items():
            if op not in valid_ops:
                raise ValueError(f"Invalid aggregation '{op}'. Must be one of: {', '.join(valid_ops)}")
        
        return v


class TextCleanupOperation(BaseModel):
    """Text cleanup operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["text_cleanup"] = "text_cleanup"
    params: Dict[str, Any] = Field(
        ...,
        description="Text cleanup parameters: column, operations (list: trim, lowercase, uppercase, remove_symbols)"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate text cleanup operation parameters."""
        required_keys = {'column', 'operations'}
        if not required_keys.issubset(v.keys()):
            missing = required_keys - set(v.keys())
            raise ValueError(f"Missing required keys: {missing}")
        
        operations = v.get('operations', [])
        if not isinstance(operations, list) or len(operations) == 0:
            raise ValueError("'operations' must be a non-empty list")
        
        valid_ops = {'trim', 'lowercase', 'uppercase', 'remove_symbols'}
        for op in operations:
            if op not in valid_ops:
                raise ValueError(f"Invalid operation '{op}'. Must be one of: {', '.join(valid_ops)}")
        
        return v


class SplitColumnOperation(BaseModel):
    """Split column operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["split_column"] = "split_column"
    params: Dict[str, Any] = Field(
        ...,
        description="Split column parameters: column, separator, newColumns (list of new column names)"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate split column operation parameters."""
        required_keys = {'column', 'separator', 'newColumns'}
        if not required_keys.issubset(v.keys()):
            missing = required_keys - set(v.keys())
            raise ValueError(f"Missing required keys: {missing}")
        
        new_columns = v.get('newColumns', [])
        if not isinstance(new_columns, list) or len(new_columns) == 0:
            raise ValueError("'newColumns' must be a non-empty list")
        
        return v


class MergeColumnsOperation(BaseModel):
    """Merge columns operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["merge_columns"] = "merge_columns"
    params: Dict[str, Any] = Field(
        ...,
        description="Merge columns parameters: columns (list), newColumn, separator (optional, default: ' ')"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate merge columns operation parameters."""
        required_keys = {'columns', 'newColumn'}
        if not required_keys.issubset(v.keys()):
            missing = required_keys - set(v.keys())
            raise ValueError(f"Missing required keys: {missing}")
        
        columns = v.get('columns', [])
        if not isinstance(columns, list) or len(columns) < 2:
            raise ValueError("'columns' must be a list with at least 2 column names")
        
        return v


class DateFormatOperation(BaseModel):
    """Date format standardization operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["date_format"] = "date_format"
    params: Dict[str, Any] = Field(
        ...,
        description="Date format parameters: column, outputFormat (e.g., 'YYYY-MM-DD', 'DD/MM/YYYY')"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate date format operation parameters."""
        required_keys = {'column', 'outputFormat'}
        if not required_keys.issubset(v.keys()):
            missing = required_keys - set(v.keys())
            raise ValueError(f"Missing required keys: {missing}")
        
        return v


class RemoveBlankRowsOperation(BaseModel):
    """Remove blank rows operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["remove_blank_rows"] = "remove_blank_rows"
    params: Dict[str, Any] = Field(
        ...,
        description="Remove blank rows parameters: columns (optional list, if not provided checks all columns)"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate remove blank rows operation parameters."""
        # columns is optional
        if 'columns' in v and v['columns'] is not None:
            if not isinstance(v['columns'], list):
                raise ValueError("'columns' must be a list of column names")
        
        return v


class ConvertToNumericOperation(BaseModel):
    """Convert text to numeric operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["convert_to_numeric"] = "convert_to_numeric"
    params: Dict[str, Any] = Field(
        ...,
        description="Convert to numeric parameters: column, errors (optional: 'coerce', 'raise', 'ignore')"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate convert to numeric operation parameters."""
        required_keys = {'column'}
        if not required_keys.issubset(v.keys()):
            missing = required_keys - set(v.keys())
            raise ValueError(f"Missing required keys: {missing}")
        
        errors = v.get('errors', 'coerce')
        if errors not in {'coerce', 'raise', 'ignore'}:
            raise ValueError("'errors' must be one of: 'coerce', 'raise', 'ignore'")
        
        return v


class GrossProfitOperation(BaseModel):
    """Gross profit calculation operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["gross_profit"] = "gross_profit"
    params: Dict[str, Any] = Field(
        ...,
        description="Gross profit parameters: revenueColumn, costOfGoodsSoldColumn, newColumn"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate gross profit operation parameters."""
        required_keys = {'revenueColumn', 'costOfGoodsSoldColumn', 'newColumn'}
        if not required_keys.issubset(v.keys()):
            missing = required_keys - set(v.keys())
            raise ValueError(f"Missing required keys: {missing}")
        
        return v


class NetProfitOperation(BaseModel):
    """Net profit calculation operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["net_profit"] = "net_profit"
    params: Dict[str, Any] = Field(
        ...,
        description="Net profit parameters: grossProfitColumn, expensesColumn, newColumn"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate net profit operation parameters."""
        required_keys = {'grossProfitColumn', 'expensesColumn', 'newColumn'}
        if not required_keys.issubset(v.keys()):
            missing = required_keys - set(v.keys())
            raise ValueError(f"Missing required keys: {missing}")
        
        return v


class ProfitLossOperation(BaseModel):
    """Monthly/Quarterly Profit & Loss operation model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique operation ID")
    type: Literal["profit_loss"] = "profit_loss"
    params: Dict[str, Any] = Field(
        ...,
        description="P&L parameters: dateColumn, revenueColumn, costColumn, period (monthly/quarterly), newColumns (dict with column names)"
    )

    @field_validator('params')
    @classmethod
    def validate_params(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate profit & loss operation parameters."""
        required_keys = {'dateColumn', 'revenueColumn', 'costColumn', 'period'}
        if not required_keys.issubset(v.keys()):
            missing = required_keys - set(v.keys())
            raise ValueError(f"Missing required keys: {missing}")
        
        period = v.get('period')
        if period not in {'monthly', 'quarterly'}:
            raise ValueError("'period' must be 'monthly' or 'quarterly'")
        
        return v


# Union type for all operations
Operation = Union[
    FilterOperation,
    ReplaceOperation,
    MathOperation,
    SortOperation,
    SelectColumnsOperation,
    RemoveDuplicatesOperation,
    AggregateOperation,
    TextCleanupOperation,
    SplitColumnOperation,
    MergeColumnsOperation,
    DateFormatOperation,
    RemoveBlankRowsOperation,
    ConvertToNumericOperation,
    GrossProfitOperation,
    NetProfitOperation,
    ProfitLossOperation
]
