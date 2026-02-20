import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Filter,
  Replace,
  Calculator,
  ArrowUpDown,
  Columns,
  Copy,
  BarChart3,
  Type,
  Scissors,
  Merge,
  Calendar,
  Eraser,
  Hash,
  TrendingUp,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
} from 'lucide-react'

interface OperationCategory {
  id: string
  name: string
  icon: React.ReactNode
  operations: OperationItem[]
}

interface OperationItem {
  id: string
  name: string
  description: string
  type: string
  icon: React.ReactNode
  category: string
}

interface OperationsPanelProps {
  onSelectOperation: (operationType: string) => void
  selectedOperation?: string
  collapsed?: boolean
}

const operationCategories: OperationCategory[] = [
  {
    id: 'filter',
    name: 'Filter & Sort',
    icon: <Filter className="h-4 w-4" />,
    operations: [
      {
        id: 'filter',
        name: 'Filter Rows',
        description: 'Filter rows based on conditions',
        type: 'filter',
        icon: <Filter className="h-4 w-4" />,
        category: 'filter',
      },
      {
        id: 'sort',
        name: 'Sort',
        description: 'Sort rows by one or more columns',
        type: 'sort',
        icon: <ArrowUpDown className="h-4 w-4" />,
        category: 'filter',
      },
    ],
  },
  {
    id: 'transform',
    name: 'Transform Data',
    icon: <Replace className="h-4 w-4" />,
    operations: [
      {
        id: 'replace',
        name: 'Find & Replace',
        description: 'Replace values in columns',
        type: 'replace',
        icon: <Replace className="h-4 w-4" />,
        category: 'transform',
      },
      {
        id: 'text_cleanup',
        name: 'Text Cleanup',
        description: 'Trim, lowercase, uppercase, remove symbols',
        type: 'text_cleanup',
        icon: <Type className="h-4 w-4" />,
        category: 'transform',
      },
      {
        id: 'split_column',
        name: 'Split Column',
        description: 'Split combined fields into separate columns',
        type: 'split_column',
        icon: <Scissors className="h-4 w-4" />,
        category: 'transform',
      },
      {
        id: 'merge_columns',
        name: 'Merge Columns',
        description: 'Combine multiple columns into one',
        type: 'merge_columns',
        icon: <Merge className="h-4 w-4" />,
        category: 'transform',
      },
      {
        id: 'date_format',
        name: 'Date Format',
        description: 'Standardize date formats',
        type: 'date_format',
        icon: <Calendar className="h-4 w-4" />,
        category: 'transform',
      },
      {
        id: 'convert_to_numeric',
        name: 'Convert to Number',
        description: 'Convert text to numeric values',
        type: 'convert_to_numeric',
        icon: <Hash className="h-4 w-4" />,
        category: 'transform',
      },
    ],
  },
  {
    id: 'calculate',
    name: 'Calculate',
    icon: <Calculator className="h-4 w-4" />,
    operations: [
      {
        id: 'math',
        name: 'Math Operations',
        description: 'Add, subtract, multiply, divide',
        type: 'math',
        icon: <Calculator className="h-4 w-4" />,
        category: 'calculate',
      },
      {
        id: 'gross_profit',
        name: 'Gross Profit',
        description: 'Calculate Revenue - Cost of Goods Sold',
        type: 'gross_profit',
        icon: <TrendingUp className="h-4 w-4" />,
        category: 'calculate',
      },
      {
        id: 'net_profit',
        name: 'Net Profit',
        description: 'Calculate Gross Profit - Expenses',
        type: 'net_profit',
        icon: <DollarSign className="h-4 w-4" />,
        category: 'calculate',
      },
      {
        id: 'profit_loss',
        name: 'P&L Statement',
        description: 'Monthly/Quarterly Profit & Loss',
        type: 'profit_loss',
        icon: <FileText className="h-4 w-4" />,
        category: 'calculate',
      },
    ],
  },
  {
    id: 'clean',
    name: 'Clean Data',
    icon: <Eraser className="h-4 w-4" />,
    operations: [
      {
        id: 'remove_duplicates',
        name: 'Remove Duplicates',
        description: 'Remove duplicate rows',
        type: 'remove_duplicates',
        icon: <Copy className="h-4 w-4" />,
        category: 'clean',
      },
      {
        id: 'remove_blank_rows',
        name: 'Remove Blank Rows',
        description: 'Clean empty rows',
        type: 'remove_blank_rows',
        icon: <Eraser className="h-4 w-4" />,
        category: 'clean',
      },
    ],
  },
  {
    id: 'organize',
    name: 'Organize',
    icon: <Columns className="h-4 w-4" />,
    operations: [
      {
        id: 'select_columns',
        name: 'Select Columns',
        description: 'Choose which columns to keep',
        type: 'select_columns',
        icon: <Columns className="h-4 w-4" />,
        category: 'organize',
      },
      {
        id: 'aggregate',
        name: 'Aggregate',
        description: 'Sum, average, count, min, max, etc.',
        type: 'aggregate',
        icon: <BarChart3 className="h-4 w-4" />,
        category: 'organize',
      },
    ],
  },
]

export function OperationsPanel({ onSelectOperation, selectedOperation, collapsed = false }: OperationsPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(operationCategories.map(cat => cat.id))
  )

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // Collapsed state - icon-only sidebar
  if (collapsed) {
    return (
      <div className="w-full h-full bg-[#217346] flex flex-col items-center justify-start py-4 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <button
          onClick={() => onSelectOperation('')}
          className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-150"
          aria-label="Add transformation"
          title="Add transformation"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <Card className="h-full border-r-0 rounded-none">
      <CardHeader className="bg-[#217346] text-white py-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Operations
        </CardTitle>
        <CardDescription className="text-white/80 text-xs">
          {operationCategories.reduce((sum, cat) => sum + cat.operations.length, 0)} operations available
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="divide-y divide-gray-200">
          {operationCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id)
            return (
              <div key={category.id} className="bg-white">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-blue-600">{category.icon}</div>
                    <span className="font-medium text-sm text-gray-700">{category.name}</span>
                    <span className="text-xs text-gray-500">({category.operations.length})</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                {isExpanded && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    {category.operations.map((operation) => (
                      <button
                        key={operation.id}
                        onClick={() => onSelectOperation(operation.type)}
                        className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors ${
                          selectedOperation === operation.type
                            ? 'bg-blue-100 border-l-4 border-blue-600'
                            : 'border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${selectedOperation === operation.type ? 'text-blue-600' : 'text-gray-500'}`}>
                            {operation.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm ${selectedOperation === operation.type ? 'text-blue-900' : 'text-gray-700'}`}>
                              {operation.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {operation.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

