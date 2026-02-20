import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import type { Operation } from '@/lib/api'
import { OPERATION_CATEGORIES } from './operationsConfig'

interface PipelineOperation extends Operation {
  id: string
  summary: string
}

function getOperationIcon(type: string) {
  for (const cat of OPERATION_CATEGORIES) {
    const op = cat.operations.find((o) => o.type === type)
    if (op) return op.icon
  }
  return null
}

interface SortableOperationCardProps {
  operation: PipelineOperation
  index: number
  onEdit: () => void
  onDelete: () => void
}

export function SortableOperationCard({ operation, index, onEdit, onDelete }: SortableOperationCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: operation.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Icon = getOperationIcon(operation.type)

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-shadow ${isDragging ? 'opacity-50 ring-2 ring-primary shadow-md' : ''}`}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
            <span className="text-sm font-medium capitalize">{operation.type.replace(/_/g, ' ')}</span>
            <span className="text-xs text-muted-foreground">#{index + 1}</span>
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{operation.summary}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8" aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive hover:text-destructive" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
