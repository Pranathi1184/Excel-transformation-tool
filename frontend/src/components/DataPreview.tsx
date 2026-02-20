import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Eye } from 'lucide-react'
import { EditableTable } from '@/components/EditableTable'
import { type PreviewResponse } from '@/lib/api'
import { toast } from 'sonner'

interface DataPreviewProps {
  fileId?: string
  filename?: string
  sheets: string[]
  initialSheet?: string
  previewData?: PreviewResponse | null
}

export function DataPreview({ sheets, initialSheet, previewData: externalPreviewData }: DataPreviewProps) {
  const [selectedSheet] = useState<string>(initialSheet || sheets[0])
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(externalPreviewData || null)
  const isLoading = false
  const error: string | null = null

  // Sync with external data changes
  useEffect(() => {
    if (externalPreviewData) {
      setPreviewData(externalPreviewData)
    }
  }, [externalPreviewData])

  // This component expects preview data to be passed from parent
  // after initial upload-preview call
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Data Preview
        </CardTitle>
        <CardDescription>
          Previewing: {selectedSheet}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : previewData ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Showing {previewData.rows.length} rows
            </div>
            <EditableTable
              columns={previewData.columns}
              rows={previewData.rows}
              editable={true}
              showSaveButton={true}
              maxHeight="600px"
              onSave={(updatedRows) => {
                setPreviewData({
                  ...previewData,
                  rows: updatedRows,
                })
                toast.success('Data updated')
              }}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No preview data available. Upload a file to see preview.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

