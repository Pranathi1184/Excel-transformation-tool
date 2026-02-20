import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Zap, Download, Loader2 } from 'lucide-react'
import { excelApi, type BatchTransformRequest, type BatchTransformResponse, type UploadResponse, type Operation } from '@/lib/api'
import { PipelineBuilder } from '@/components/PipelineBuilder'

interface BatchProcessorProps {
  files: UploadResponse[]
  onError?: (error: string) => void
  onSuccess?: (result: import('@/lib/api').BatchTransformResponse) => void
}

export function BatchProcessor({ files, onError, onSuccess }: BatchProcessorProps) {
  const [sheetName, setSheetName] = useState<string>('')
  const [operations, setOperations] = useState<Operation[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [columnsLoading, setColumnsLoading] = useState(false)
  const [outputFormat, setOutputFormat] = useState<'individual' | 'zip'>('zip')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<BatchTransformResponse | null>(null)

  // Get common sheet name (use first file's first sheet as default)
  const commonSheets = files.length > 0 ? files[0].sheets : []
  const defaultSheet = commonSheets[0] || ''
  const firstFile = files[0]

  // Load columns from first file when sheet is selected (for PipelineBuilder)
  useEffect(() => {
    if (!firstFile || !sheetName) {
      setColumns([])
      return
    }
    let cancelled = false
    setColumnsLoading(true)
    excelApi.previewSheet(firstFile.fileId, sheetName, 5)
      .then((res) => {
        if (!cancelled && res.columns) setColumns(res.columns)
      })
      .catch(() => {
        if (!cancelled) setColumns([])
      })
      .finally(() => {
        if (!cancelled) setColumnsLoading(false)
      })
    return () => { cancelled = true }
  }, [firstFile?.fileId, sheetName])

  const handleBatchProcess = async () => {
    if (!sheetName) {
      onError?.('Please select a sheet name')
      return
    }

    if (operations.length === 0) {
      onError?.('Please add at least one operation to the pipeline')
      return
    }

    setIsProcessing(true)
    try {
      const request: BatchTransformRequest = {
        fileIds: files.map(f => f.fileId),
        sheetName,
        operations,
        outputFormat,
      }

      const result = await excelApi.batchTransform(request)
      setResults(result)
      onSuccess?.(result)
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Batch processing failed'
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadZip = async () => {
    if (!results?.zipUrl) return

    try {
      const response = await fetch(results.zipUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `batch_transformed_${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      onError?.(`Download failed: ${error.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Batch Processing Configuration
          </CardTitle>
          <CardDescription>
            Apply the same transformation pipeline to {files.length} files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="sheet-name">Sheet Name (applies to all files)</Label>
            <Select value={sheetName || defaultSheet} onValueChange={setSheetName}>
              <SelectTrigger id="sheet-name">
                <SelectValue placeholder="Select sheet" />
              </SelectTrigger>
              <SelectContent>
                {commonSheets.map((sheet) => (
                  <SelectItem key={sheet} value={sheet}>
                    {sheet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="output-format">Output Format</Label>
            <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as any)}>
              <SelectTrigger id="output-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zip">ZIP File (All files in one archive)</SelectItem>
                <SelectItem value="individual">Individual Files</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Builder - same as single-file mode */}
      {sheetName && firstFile && (
        <Card>
          <CardHeader>
            <CardTitle>Transformation Pipeline</CardTitle>
            <CardDescription>
              Build your pipeline. Operations will be applied to all {files.length} files.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {columnsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading columns...
              </div>
            ) : columns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Select a sheet and wait for columns to load, or the sheet may be empty.
              </p>
            ) : (
              <PipelineBuilder
                fileId={firstFile.fileId}
                sheetName={sheetName}
                columns={columns}
                onTransformSuccess={() => {}}
                onError={onError}
                onOperationsChange={setOperations}
                batchMode
              />
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleBatchProcess}
            disabled={isProcessing || !sheetName || operations.length === 0}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing {files.length} files...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Process All Files
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle>Batch Processing Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {results.results.map((result, idx) => (
                <div key={idx} className="text-sm p-2 bg-muted rounded">
                  <strong>{result.fileName}</strong>: {result.rowCountBefore} → {result.rowCountAfter} rows
                </div>
              ))}
            </div>

            {results.zipUrl && (
              <Button onClick={handleDownloadZip} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download ZIP File
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

