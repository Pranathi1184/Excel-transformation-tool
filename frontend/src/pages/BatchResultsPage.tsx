/**
 * Batch results: summary and download ZIP.
 */
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Home, RotateCcw } from 'lucide-react'
import type { BatchTransformResponse } from '@/lib/api'

export function BatchResultsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const result = location.state?.result as BatchTransformResponse | undefined

  const handleDownloadZip = async () => {
    if (!result?.zipUrl) return
    try {
      const url = result.zipUrl.startsWith('http') ? result.zipUrl : `${window.location.origin}${result.zipUrl.startsWith('/') ? '' : '/'}${result.zipUrl}`
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `batch_transformed_${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(blobUrl)
      document.body.removeChild(a)
    } catch {
      window.open(result.zipUrl, '_blank')
    }
  }

  if (!result) {
    navigate('/batch', { replace: true })
    return null
  }

  const successCount = result.results?.length ?? 0
  const errorCount = result.errors?.length ?? 0

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Batch Processing Complete</CardTitle>
          <CardContent className="pt-0">
            <p className="text-muted-foreground">
              {successCount} file(s) processed successfully.
              {errorCount > 0 && ` ${errorCount} file(s) failed.`}
            </p>
          </CardContent>
        </CardHeader>
      </Card>

      {result.results && result.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.results.map((r, idx) => (
              <div key={idx} className="text-sm p-2 bg-muted rounded flex justify-between">
                <span className="font-medium truncate mr-2">{r.fileName}</span>
                <span className="text-muted-foreground shrink-0">
                  {r.rowCountBefore} → {r.rowCountAfter} rows
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {result.errors && result.errors.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Errors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.errors.map((e, idx) => (
              <div key={idx} className="text-sm p-2 bg-destructive/10 rounded">
                <span className="font-medium">{e.fileName}</span>: {e.error}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        {result.zipUrl && (
          <Button onClick={handleDownloadZip} size="lg" className="gap-2">
            <Download className="h-5 w-5" />
            Download All (ZIP)
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link to="/batch" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Process More
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/" className="gap-2">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
