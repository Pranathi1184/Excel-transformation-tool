/**
 * History Page: View transformation history and replay pipelines
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, RotateCcw, Trash2, History as HistoryIcon } from 'lucide-react'
import { loadTransformationHistory, deleteTransformationHistory } from '@/lib/supabase-history'
import { downloadFile } from '@/lib/supabase-storage'
import { type TransformationHistory } from '@/lib/supabase'
import { toast } from 'sonner'
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
import { useApp } from '@/context/AppContext'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 86400000 * 7) return `${Math.floor(diff / 86400000)}d ago`
  return formatDate(dateString)
}

export function HistoryPage() {
  const navigate = useNavigate()
  const { setOperations } = useApp()
  const [history, setHistory] = useState<TransformationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<TransformationHistory | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const data = await loadTransformationHistory(50)
      setHistory(data)
    } catch (error) {
      console.error('Failed to load history:', error)
      toast.error('Failed to load transformation history')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (record: TransformationHistory) => {
    if (!record.transformed_file_url) {
      toast.error('File URL not available')
      return
    }

    const success = await downloadFile(record.transformed_file_url, record.file_name)
    if (success) {
      toast.success('File downloaded')
    }
  }

  const handleReplay = (record: TransformationHistory) => {
    // Set operations in context and navigate to pipeline page
    setOperations(record.operations)
    toast.success('Pipeline loaded. Upload a file to use it.')
    navigate('/upload/single')
  }

  const handleDelete = async () => {
    if (!confirmDelete) return

    const success = await deleteTransformationHistory(confirmDelete.id)
    if (success) {
      await loadHistory()
      setConfirmDelete(null)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            Transformation History
          </CardTitle>
          <CardDescription>
            View all your past transformations and replay pipelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <HistoryIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">No transformation history</p>
              <p className="text-sm text-muted-foreground mb-4">
                Transform a file to see it appear here
              </p>
              <Button onClick={() => navigate('/upload/single')}>Transform a File</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Operations</TableHead>
                    <TableHead>Rows</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.file_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {record.operations.length} operation{record.operations.length !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.row_count_before != null && record.row_count_after != null ? (
                          <span className="text-sm">
                            {record.row_count_before.toLocaleString()} →{' '}
                            {record.row_count_after.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={record.status === 'success' ? 'default' : 'destructive'}
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatRelativeTime(record.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {record.status === 'success' && record.transformed_file_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(record)}
                              title="Download transformed file"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {record.status === 'success' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReplay(record)}
                              title="Replay this pipeline"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmDelete(record)}
                            className="text-destructive hover:text-destructive"
                            title="Delete history record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete history record?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete transformation record for &quot;{confirmDelete?.file_name}&quot;? This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
