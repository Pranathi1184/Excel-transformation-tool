/**
 * Operation categories and metadata for progressive disclosure (category → operation → configure).
 */
import {
  Filter,
  Copy,
  Eraser,
  Sparkles,
  Columns,
  Replace,
  RefreshCw,
  Calculator,
  Hash,
  ArrowUpDown,
  SplitSquareVertical,
  Merge,
  TrendingUp,
  DollarSign,
  BarChart3,
  Sigma,
  Calendar,
  type LucideIcon,
} from 'lucide-react'

export const CATEGORY_ICONS = {
  cleaning: Sparkles,
  transformation: RefreshCw,
  financial: DollarSign,
  advanced: BarChart3,
} as const

const _OPERATION_META: Record<string, { label: string; description: string; icon: LucideIcon }> = {
  filter: { label: 'Filter Rows', description: 'Keep rows matching conditions', icon: Filter },
  remove_duplicates: { label: 'Remove Duplicates', description: 'Remove duplicate rows', icon: Copy },
  remove_blank_rows: { label: 'Remove Blank Rows', description: 'Remove rows with empty cells', icon: Eraser },
  text_cleanup: { label: 'Text Cleanup', description: 'Trim, lowercase, remove special chars', icon: Sparkles },
  select_columns: { label: 'Select Columns', description: 'Keep only specific columns', icon: Columns },
  replace: { label: 'Find & Replace', description: 'Replace text in column', icon: Replace },
  math: { label: 'Math Operations', description: 'Add, subtract, multiply, divide', icon: Calculator },
  convert_to_numeric: { label: 'Convert to Number', description: 'Parse text as numbers', icon: Hash },
  sort: { label: 'Sort', description: 'Order rows by column values', icon: ArrowUpDown },
  split_column: { label: 'Split Column', description: 'Split text into multiple columns', icon: SplitSquareVertical },
  merge_columns: { label: 'Merge Columns', description: 'Combine multiple columns', icon: Merge },
  gross_profit: { label: 'Gross Profit', description: 'Revenue minus COGS', icon: TrendingUp },
  net_profit: { label: 'Net Profit', description: 'Gross profit minus expenses', icon: DollarSign },
  profit_loss: { label: 'P&L Statement', description: 'Monthly/quarterly profit and loss', icon: BarChart3 },
  aggregate: { label: 'Aggregate', description: 'Group and summarize data', icon: Sigma },
  date_format: { label: 'Date Format', description: 'Convert date formats', icon: Calendar },
}

export const OPERATION_META = _OPERATION_META

/** Extended help text for HelpTooltip on each operation. */
export const OPERATION_HELP: Record<string, string> = {
  filter: "Keep or remove rows based on conditions. Example: Show only sales > $1000",
  replace: "Find and replace text values. Example: Change 'USA' to 'United States'",
  math: "Create calculated columns. Example: Revenue - Cost = Profit",
  sort: "Order rows by column values, ascending or descending",
  select_columns: "Keep only the columns you need. Hide or remove the rest.",
  remove_duplicates: "Remove duplicate rows. Optionally consider only certain columns.",
  remove_blank_rows: "Remove rows where selected columns have empty cells.",
  text_cleanup: "Trim spaces, change case, or remove special characters from text.",
  split_column: "Split one column into multiple columns using a separator.",
  merge_columns: "Combine multiple columns into one (e.g. First + Last name).",
  convert_to_numeric: "Parse text as numbers so you can do math on the column.",
  date_format: "Convert date formats (e.g. MM/DD/YYYY to YYYY-MM-DD).",
  gross_profit: "Revenue minus cost of goods sold. Add a gross profit column.",
  net_profit: "Gross profit minus expenses. Add a net profit column.",
  profit_loss: "Monthly or quarterly P&L: revenue, costs, and profit by period.",
  aggregate: "Group by column(s) and summarize (sum, average, count, etc.).",
}

export interface CategoryDef {
  id: string
  title: string
  icon: LucideIcon
  operations: { type: string; label: string; description: string; icon: LucideIcon }[]
}

export const OPERATION_CATEGORIES: CategoryDef[] = [
  {
    id: 'cleaning',
    title: 'Data Cleaning',
    icon: Sparkles,
    operations: [
      { type: 'filter', ..._OPERATION_META.filter },
      { type: 'remove_duplicates', ..._OPERATION_META.remove_duplicates },
      { type: 'remove_blank_rows', ..._OPERATION_META.remove_blank_rows },
      { type: 'text_cleanup', ..._OPERATION_META.text_cleanup },
      { type: 'select_columns', ..._OPERATION_META.select_columns },
    ],
  },
  {
    id: 'transformation',
    title: 'Transformation',
    icon: RefreshCw,
    operations: [
      { type: 'replace', ..._OPERATION_META.replace },
      { type: 'math', ..._OPERATION_META.math },
      { type: 'convert_to_numeric', ..._OPERATION_META.convert_to_numeric },
      { type: 'sort', ..._OPERATION_META.sort },
      { type: 'split_column', ..._OPERATION_META.split_column },
      { type: 'merge_columns', ..._OPERATION_META.merge_columns },
    ],
  },
  {
    id: 'financial',
    title: 'Financial',
    icon: DollarSign,
    operations: [
      { type: 'gross_profit', ..._OPERATION_META.gross_profit },
      { type: 'net_profit', ..._OPERATION_META.net_profit },
      { type: 'profit_loss', ..._OPERATION_META.profit_loss },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: BarChart3,
    operations: [
      { type: 'aggregate', ..._OPERATION_META.aggregate },
      { type: 'date_format', ..._OPERATION_META.date_format },
    ],
  },
]

export type OperationType = keyof typeof OPERATION_META

function getOperationLabel(type: string): string {
  return OPERATION_META[type]?.label ?? type.replace(/_/g, ' ')
}

export { getOperationLabel }
