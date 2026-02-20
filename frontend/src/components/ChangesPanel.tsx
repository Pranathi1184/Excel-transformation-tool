import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type OperationChange } from '@/lib/api'
import { CheckCircle2, ArrowRight, FileText, Hash, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChangesPanelProps {
  changes: OperationChange[]
  onClose?: () => void
  isOpen?: boolean
}

export function ChangesPanel({ changes, onClose, isOpen = true }: ChangesPanelProps) {
  // If used as slide-in panel
  if (onClose) {
    if (!changes || changes.length === 0) {
      return (
        <div
          className={cn(
            'fixed right-0 top-0 h-full w-[360px] bg-white shadow-xl z-[100]',
            'transform transition-transform duration-300 ease-out',
            isOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Changes Applied</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close panel"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="p-4">
            <div className="text-center py-8 text-gray-400 text-sm">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No transformations have been applied yet</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-[360px] bg-white shadow-xl z-[100] flex flex-col',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Changes Applied</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close panel"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {renderChangesContent(changes)}
        </div>
      </div>
    )
  }

  // Legacy card-based rendering (for backward compatibility)
  if (!changes || changes.length === 0) {
    return (
      <Card className="h-full border-gray-300">
        <CardHeader className="bg-[#F2F2F2] border-b border-gray-300">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Changes Applied
          </CardTitle>
          <CardDescription className="text-xs">
            No changes detected
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8 text-gray-400 text-sm">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No transformations have been applied yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalCellsChanged = changes.reduce((sum, op) => sum + op.cellsChanged.length, 0)
  const totalRowsAffected = new Set(changes.flatMap(op => op.rowsAffected)).size
  const totalColumnsAffected = new Set(changes.flatMap(op => op.columnsAffected)).size

  return (
    <Card className="h-full border-gray-300 flex flex-col">
      <CardHeader className="bg-[#F2F2F2] border-b border-gray-300">
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Changes Applied
        </CardTitle>
        <CardDescription className="text-xs">
          {changes.length} operation{changes.length !== 1 ? 's' : ''} • {totalCellsChanged} cell{totalCellsChanged !== 1 ? 's' : ''} changed • {totalRowsAffected} rows, {totalColumnsAffected} columns
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-y-auto">
        {renderChangesContent(changes)}
      </CardContent>
    </Card>
  )
}

function renderChangesContent(changes: OperationChange[]) {
  const totalCellsChanged = changes.reduce((sum, op) => sum + op.cellsChanged.length, 0)
  const totalRowsAffected = new Set(changes.flatMap(op => op.rowsAffected)).size
  const totalColumnsAffected = new Set(changes.flatMap(op => op.columnsAffected)).size

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-blue-600 font-semibold">{totalCellsChanged}</div>
            <div className="text-blue-700">Cells Changed</div>
          </div>
          <div>
            <div className="text-blue-600 font-semibold">{totalRowsAffected}</div>
            <div className="text-blue-700">Rows Affected</div>
          </div>
          <div>
            <div className="text-blue-600 font-semibold">{totalColumnsAffected}</div>
            <div className="text-blue-700">Columns Affected</div>
          </div>
        </div>
      </div>

      {/* Operation Changes */}
      {changes.map((opChange, idx) => (
        <div key={idx} className="border border-gray-300 rounded p-3 bg-white">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                #{opChange.operationIndex + 1}
              </Badge>
              <span className="text-sm font-semibold text-gray-800 capitalize">
                {opChange.operationType.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Cell Changes */}
          {opChange.cellsChanged.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-xs font-medium text-gray-600 mb-2">
                Cell Changes ({opChange.cellsChanged.length}):
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {opChange.cellsChanged.slice(0, 20).map((cell, cellIdx) => (
                  <div
                    key={cellIdx}
                    className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-700">
                        Row {cell.rowIndex + 1}, Column: <span className="text-blue-600">{cell.column}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded line-through">
                          {String(cell.oldValue)}
                        </span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                          {String(cell.newValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {opChange.cellsChanged.length > 20 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    + {opChange.cellsChanged.length - 20} more changes
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rows Affected */}
          {opChange.rowsAffected.length > 0 && opChange.cellsChanged.length === 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-600">
                <Hash className="h-3 w-3 inline mr-1" />
                {opChange.rowsAffected.length} row{opChange.rowsAffected.length !== 1 ? 's' : ''} affected
              </div>
            </div>
          )}

          {/* Columns Affected */}
          {opChange.columnsAffected.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-600 mb-1">Columns:</div>
              <div className="flex flex-wrap gap-1">
                {opChange.columnsAffected.map((col, colIdx) => (
                  <Badge key={colIdx} variant="secondary" className="text-xs">
                    {col}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

