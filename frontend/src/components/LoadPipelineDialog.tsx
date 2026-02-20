/**
 * Dialog to load a saved pipeline. List with Load / Delete; optional rename.
 */
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { loadPipelines, deletePipeline, type SavedPipeline } from '@/lib/supabase-pipelines'
import type { Operation } from '@/lib/api'
import { toast } from 'sonner'
import { FolderOpen, Trash2, Loader2 } from 'lucide-react'

function formatRelativeTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 86400000 * 7) return `${Math.floor(diff / 86400000)} days ago`
  return d.toLocaleDateString()
}

interface LoadPipelineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoad: (operations: Operation[]) => void
  hasCurrentChanges?: boolean
  currentCount?: number
}

export function LoadPipelineDialog({
  open,
  onOpenChange,
  onLoad,
  hasCurrentChanges = false,
  currentCount = 0,
}: LoadPipelineDialogProps) {
  const [pipelines, setPipelines] = useState<SavedPipeline[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmLoad, setConfirmLoad] = useState<SavedPipeline | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<SavedPipeline | null>(null)

  useEffect(() => {
    if (open) {
      loadPipelinesList()
    }
  }, [open])

  const loadPipelinesList = async () => {
    setLoading(true)
    try {
      const data = await loadPipelines()
      setPipelines(data)
    } catch (error) {
      console.error('Failed to load pipelines:', error)
      toast.error('Failed to load pipelines')
    } finally {
      setLoading(false)
    }
  }

  const handleLoad = (p: SavedPipeline) => {
    if (hasCurrentChanges && currentCount > 0) {
      setConfirmLoad(p)
      return
    }
    doLoad(p)
  }

  const doLoad = (p: SavedPipeline) => {
    onLoad(p.operations)
    toast.success(`Pipeline '${p.name}' loaded`)
    onOpenChange(false)
    setConfirmLoad(null)
  }

  const handleDelete = (p: SavedPipeline) => {
    setConfirmDelete(p)
  }

  const doDelete = async () => {
    if (confirmDelete) {
      const success = await deletePipeline(confirmDelete.id)
      if (success) {
        await loadPipelinesList()
        setConfirmDelete(null)
      }
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Load pipeline
            </DialogTitle>
            <DialogDescription>
              Choose a saved pipeline to load. Current pipeline will be replaced.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto py-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading pipelines...</span>
              </div>
            ) : pipelines.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No saved pipelines</p>
            ) : (
              pipelines.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{p.name}</p>
                    {p.description && (
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {p.operations.length} operation{p.operations.length !== 1 ? 's' : ''}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Saved {formatRelativeTime(p.updated_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="bg-[#217346] hover:bg-[#1a5a38]"
                      onClick={() => handleLoad(p)}
                    >
                      Load
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(p)}
                      aria-label="Delete pipeline"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmLoad} onOpenChange={(o) => !o && setConfirmLoad(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Load pipeline?</AlertDialogTitle>
            <AlertDialogDescription>
              Load pipeline &quot;{confirmLoad?.name}&quot;? Current pipeline will be replaced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#217346] hover:bg-[#1a5a38]"
              onClick={() => confirmLoad && doLoad(confirmLoad)}
            >
              Load
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete pipeline?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{confirmDelete?.name}&quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={doDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
