/**
 * Dialog to save the current pipeline with name and optional description.
 */
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { savePipeline as savePipelineSupabase } from '@/lib/supabase-pipelines'
import type { Operation } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SavePipelineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  operations: Operation[]
  onSaved?: () => void
}

function toApiOps(operations: { type: string; params: Record<string, unknown> }[]): Operation[] {
  return operations.map((op) => ({
    type: op.type as Operation['type'],
    params: op.params,
  }))
}

export function SavePipelineDialog({
  open,
  onOpenChange,
  operations,
  onSaved,
}: SavePipelineDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const apiOps = toApiOps(operations)
  const preview = operations.map((o) => o.type.replace(/_/g, ' ')).join(' → ')

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Please enter a pipeline name')
      return
    }
    const saved = await savePipelineSupabase(trimmed, apiOps, description.trim() || undefined)
    if (saved) {
      setName('')
      setDescription('')
      onOpenChange(false)
      onSaved?.()
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setName('')
      setDescription('')
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save pipeline</DialogTitle>
          <DialogDescription>
            Save this pipeline to reuse later. Stored in this browser.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="save-pipeline-name">Name</Label>
            <Input
              id="save-pipeline-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monthly cleanup"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="save-pipeline-desc">Description (optional)</Label>
            <textarea
              id="save-pipeline-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this pipeline does..."
              rows={2}
              className={cn(
                'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {apiOps.length} operation{apiOps.length !== 1 ? 's' : ''} in this pipeline
          </p>
          {preview && (
            <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              {preview}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#217346] hover:bg-[#1a5a38]">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
