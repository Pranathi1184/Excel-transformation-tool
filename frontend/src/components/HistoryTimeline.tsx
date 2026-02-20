/**
 * Timeline of pipeline history: past + present + future. Click a node to restore.
 */
import { useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, GripVertical, Circle } from 'lucide-react'
import type { PipelineOperation } from '@/components/PipelineBuilder/pipelineHistoryReducer'
import type { HistoryState } from '@/components/PipelineBuilder/pipelineHistoryReducer'
import { cn } from '@/lib/utils'

interface HistoryTimelineProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: HistoryState
  onRestore: (index: number) => void
}

type NodeItem = { ops: PipelineOperation[]; label: string; isCurrent?: boolean }

function iconForLabel(label: string) {
  const lower = label.toLowerCase()
  if (lower.includes('add') || lower.includes('added')) return Plus
  if (lower.includes('edit') || lower.includes('updated')) return Pencil
  if (lower.includes('delete') || lower.includes('removed')) return Trash2
  if (lower.includes('reorder') || lower.includes('move')) return GripVertical
  return Circle
}

export function HistoryTimeline({ open, onOpenChange, state, onRestore }: HistoryTimelineProps) {
  const nodes: NodeItem[] = [
    ...state.past.map((p) => ({ ops: p.ops, label: p.label })),
    { ops: state.present, label: 'Current state', isCurrent: true },
    ...state.future.map((f) => ({ ops: f.ops, label: f.label })),
  ]
  const currentRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open && currentRef.current) {
      currentRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pipeline history</DialogTitle>
          <DialogDescription>
            Click a state to restore. Current state is highlighted.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-y-auto py-2">
          <div className="relative flex flex-col gap-0">
            {/* vertical line */}
            <div
              className="absolute left-[15px] top-2 bottom-2 w-px bg-border"
              aria-hidden
            />
            {nodes.map((node, index) => {
              const Icon = iconForLabel(node.label)
              const isCurrent = node.isCurrent ?? false
              return (
                <button
                  key={index}
                  ref={isCurrent ? currentRef : null}
                  type="button"
                  onClick={() => {
                    if (!isCurrent) onRestore(index)
                  }}
                  className={cn(
                    'relative flex items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                    isCurrent
                      ? 'border-[#217346] bg-[#217346]/5'
                      : 'hover:bg-muted/50 border-transparent'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background',
                      isCurrent ? 'border-[#217346] text-[#217346]' : 'border-border text-muted-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{node.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {node.ops.length} operation{node.ops.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
