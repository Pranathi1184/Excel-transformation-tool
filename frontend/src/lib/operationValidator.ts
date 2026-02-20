/**
 * Real-time validation for pipeline operations: column tracking and per-operation rules.
 */
import type { Operation } from '@/lib/api'
import type { PipelineOperation } from '@/components/PipelineBuilder/pipelineHistoryReducer'

export interface ValidationSuggestion {
  label: string
  action: 'use-column' | 'move-after' | 'insert-operation' | 'add-conversion'
  data?: { column?: string; field?: string; afterIndex?: number; operationType?: string; beforeIndex?: number }
}

export interface ValidationResult {
  status: 'valid' | 'warning' | 'error'
  message?: string
  suggestions?: ValidationSuggestion[]
}

/** Levenshtein distance for fuzzy column match. */
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[m][n]
}

/** Find best matching column from list (by edit distance). */
export function findSimilarColumn(column: string, available: string[]): string | null {
  if (available.length === 0) return null
  let best = available[0]
  let bestDist = levenshtein(column.toLowerCase(), best.toLowerCase())
  for (let i = 1; i < available.length; i++) {
    const d = levenshtein(column.toLowerCase(), available[i].toLowerCase())
    if (d < bestDist) {
      bestDist = d
      best = available[i]
    }
  }
  return bestDist <= Math.min(column.length, best.length) ? best : null
}

/** Track which columns exist after applying operations up to stepIndex (0-based). */
export function getAvailableColumnsAtStep(
  operations: PipelineOperation[],
  stepIndex: number,
  initialColumns: string[]
): string[] {
  let available = [...initialColumns]
  for (let i = 0; i <= stepIndex && i < operations.length; i++) {
    const op = operations[i]
    const p = op.params
    if (op.type === 'math' && p.newColumn) {
      available.push(String(p.newColumn))
    } else if (op.type === 'gross_profit' && p.newColumn) {
      available.push(String(p.newColumn))
    } else if (op.type === 'net_profit' && p.newColumn) {
      available.push(String(p.newColumn))
    } else if (op.type === 'split_column' && Array.isArray(p.newColumns)) {
      available.push(...(p.newColumns as string[]))
    } else if (op.type === 'merge_columns' && p.newColumn) {
      available.push(String(p.newColumn))
    } else if (op.type === 'convert_to_numeric' && p.newColumn) {
      available.push(String(p.newColumn))
    } else if (op.type === 'select_columns' && Array.isArray(p.columns)) {
      available = [...(p.columns as string[])]
    }
  }
  return available
}

/** Find which operation (0-based index) creates the given column. */
function findOperationThatCreatesColumn(
  operations: PipelineOperation[],
  column: string,
  beforeIndex: number
): number | null {
  for (let i = 0; i < beforeIndex && i < operations.length; i++) {
    const op = operations[i]
    const p = op.params
    const creates =
      (op.type === 'math' && p.newColumn === column) ||
      (op.type === 'gross_profit' && p.newColumn === column) ||
      (op.type === 'net_profit' && p.newColumn === column) ||
      (op.type === 'merge_columns' && p.newColumn === column) ||
      (op.type === 'split_column' && Array.isArray(p.newColumns) && (p.newColumns as string[]).includes(column))
    if (creates) return i
  }
  return null
}

function columnError(
  column: string,
  available: string[],
  operations: PipelineOperation[],
  currentIndex: number,
  field?: string
): ValidationResult {
  const similar = findSimilarColumn(column, available)
  const createdBy = findOperationThatCreatesColumn(operations, column, currentIndex)
  const suggestions: ValidationSuggestion[] = []
  if (similar) {
    suggestions.push({ label: `Use "${similar}"`, action: 'use-column', data: { column: similar, field } })
  }
  if (createdBy !== null) {
    suggestions.push({
      label: `Move after operation #${createdBy + 1}`,
      action: 'move-after',
      data: { afterIndex: createdBy },
    })
  }
  return {
    status: 'error',
    message:
      createdBy !== null
        ? `Column '${column}' will be created by operation #${createdBy + 1}. Move this operation after it.`
        : `Column '${column}' not found.${similar ? ` Did you mean "${similar}"?` : ''}`,
    suggestions: suggestions.length ? suggestions : undefined,
  }
}

export function validateOperation(
  operation: Operation,
  availableColumns: string[],
  operationIndex: number,
  allOperations: PipelineOperation[]
): ValidationResult {
  const p = operation.params
  const cols = availableColumns

  const has = (c: string) => cols.includes(c)

  switch (operation.type) {
    case 'filter': {
      const col = p.column as string
      if (!col) return { status: 'error', message: 'Select a column.' }
      if (!has(col)) return columnError(col, cols, allOperations, operationIndex, 'column')
      return { status: 'valid' }
    }
    case 'replace': {
      const col = p.column as string
      if (!col) return { status: 'error', message: 'Select a column.' }
      if (!has(col)) return columnError(col, cols, allOperations, operationIndex, 'column')
      if (p.oldValue === '' && p.newValue === '')
        return { status: 'warning', message: 'Find and replace values are empty.' }
      return { status: 'valid' }
    }
    case 'math': {
      const colA = p.colA as string
      const colBOrValue = p.colBOrValue
      const newCol = p.newColumn as string
      if (!colA) return { status: 'error', message: 'Select column A.' }
      if (!has(colA)) return columnError(colA, cols, allOperations, operationIndex, 'colA')
      const colBIsColumn = typeof colBOrValue === 'string' && cols.includes(colBOrValue)
      if (colBIsColumn && !has(colBOrValue as string)) {
        return columnError(colBOrValue as string, cols, allOperations, operationIndex, 'colBOrValue')
      }
      if (!newCol) return { status: 'error', message: 'Enter a name for the new column.' }
      if (has(newCol)) {
        return {
          status: 'warning',
          message: `Column '${newCol}' already exists and will be overwritten.`,
        }
      }
      return { status: 'valid' }
    }
    case 'sort': {
      const columns = p.columns as { column: string; ascending: boolean }[] | undefined
      if (!Array.isArray(columns) || columns.length === 0) return { status: 'error', message: 'Select at least one column.' }
      for (const c of columns) {
        const col = c?.column
        if (!col) continue
        if (!has(col)) return columnError(col, cols, allOperations, operationIndex)
      }
      return { status: 'valid' }
    }
    case 'select_columns': {
      const selected = (p.columns as string[]) || []
      if (selected.length === 0) return { status: 'error', message: 'Select at least one column.' }
      for (const col of selected) {
        if (!has(col)) return columnError(col, cols, allOperations, operationIndex)
      }
      return { status: 'valid' }
    }
    case 'remove_duplicates': {
      const subset = (p.subset as string[] | undefined) || []
      for (const col of subset) {
        if (!has(col)) return columnError(col, cols, allOperations, operationIndex)
      }
      return { status: 'valid' }
    }
    case 'remove_blank_rows': {
      const columns = (p.columns as string[] | undefined) || []
      for (const col of columns) {
        if (!has(col)) return columnError(col, cols, allOperations, operationIndex)
      }
      return { status: 'valid' }
    }
    case 'text_cleanup': {
      const col = p.column as string
      if (!col) return { status: 'error', message: 'Select a column.' }
      if (!has(col)) return columnError(col, cols, allOperations, operationIndex, 'column')
      return { status: 'valid' }
    }
    case 'date_format': {
      const col = p.column as string
      if (!col) return { status: 'error', message: 'Select a column.' }
      if (!has(col)) return columnError(col, cols, allOperations, operationIndex, 'column')
      return { status: 'valid' }
    }
    case 'split_column': {
      const col = p.column as string
      if (!col) return { status: 'error', message: 'Select a column.' }
      if (!has(col)) return columnError(col, cols, allOperations, operationIndex, 'column')
      return { status: 'valid' }
    }
    case 'merge_columns': {
      const mergeCols = (p.columns as string[]) || []
      for (const col of mergeCols) {
        if (!has(col)) return columnError(col, cols, allOperations, operationIndex)
      }
      const newCol = p.newColumn as string
      if (has(newCol)) {
        return { status: 'warning', message: `Column '${newCol}' already exists and will be overwritten.` }
      }
      return { status: 'valid' }
    }
    case 'aggregate': {
      const groupBy = (p.groupBy as string[]) || []
      const aggregations = (p.aggregations as Record<string, string>) || {}
      for (const col of groupBy) {
        if (!has(col)) return columnError(col, cols, allOperations, operationIndex)
      }
      for (const col of Object.keys(aggregations)) {
        if (!has(col)) return columnError(col, cols, allOperations, operationIndex)
      }
      return { status: 'valid' }
    }
    case 'gross_profit': {
      const rev = p.revenueColumn as string
      const cogs = p.costOfGoodsSoldColumn as string
      const newCol = p.newColumn as string
      if (!rev) return { status: 'error', message: 'Select revenue column.' }
      if (!has(rev)) return columnError(rev, cols, allOperations, operationIndex, 'revenueColumn')
      if (!cogs) return { status: 'error', message: 'Select cost of goods sold column.' }
      if (!has(cogs)) return columnError(cogs, cols, allOperations, operationIndex, 'costOfGoodsSoldColumn')
      if (!newCol) return { status: 'error', message: 'Enter name for new column.' }
      if (has(newCol)) {
        return { status: 'warning', message: `Column '${newCol}' already exists and will be overwritten.` }
      }
      return { status: 'valid' }
    }
    case 'net_profit': {
      const grossCol = p.grossProfitColumn as string
      const expCol = p.expensesColumn as string
      const newCol = p.newColumn as string
      const createdBy = findOperationThatCreatesColumn(allOperations, grossCol, operationIndex)
      if (!grossCol) return { status: 'error', message: 'Select gross profit column.' }
      if (!has(grossCol)) {
        if (createdBy !== null) {
          return {
            status: 'error',
            message: `Column '${grossCol}' will be created by operation #${createdBy + 1}. Move this operation after it.`,
            suggestions: [
              { label: `Move after operation #${createdBy + 1}`, action: 'move-after', data: { afterIndex: createdBy } },
            ],
          }
        }
        return columnError(grossCol, cols, allOperations, operationIndex, 'grossProfitColumn')
      }
      if (!expCol) return { status: 'error', message: 'Select expenses column.' }
      if (!has(expCol)) return columnError(expCol, cols, allOperations, operationIndex, 'expensesColumn')
      if (!newCol) return { status: 'error', message: 'Enter name for new column.' }
      if (has(newCol)) {
        return { status: 'warning', message: `Column '${newCol}' already exists and will be overwritten.` }
      }
      return { status: 'valid' }
    }
    case 'profit_loss': {
      const dateCol = p.dateColumn as string
      const revCol = p.revenueColumn as string
      const costCol = p.costColumn as string
      if (!dateCol) return { status: 'error', message: 'Select date column.' }
      if (!has(dateCol)) return columnError(dateCol, cols, allOperations, operationIndex, 'dateColumn')
      if (!revCol) return { status: 'error', message: 'Select revenue column.' }
      if (!has(revCol)) return columnError(revCol, cols, allOperations, operationIndex, 'revenueColumn')
      if (!costCol) return { status: 'error', message: 'Select cost column.' }
      if (!has(costCol)) return columnError(costCol, cols, allOperations, operationIndex, 'costColumn')
      return { status: 'valid' }
    }
    case 'convert_to_numeric': {
      const col = p.column as string
      if (!col) return { status: 'error', message: 'Select a column.' }
      if (!has(col)) return columnError(col, cols, allOperations, operationIndex, 'column')
      return { status: 'valid' }
    }
    default:
      return { status: 'valid' }
  }
}
