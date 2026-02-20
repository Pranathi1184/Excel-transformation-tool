/**
 * Merge results: show merged file info; continue to transform or go home.
 */
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { Home, ArrowRight } from 'lucide-react'
import type { MergeFilesResponse } from '@/lib/api'

export function MergeResultsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { onMergeSuccess } = useApp()
  const merged = location.state?.merged as MergeFilesResponse | undefined

  const handleContinueToTransform = () => {
    if (!merged) return
    onMergeSuccess(merged)
    navigate('/preview')
  }

  if (!merged) {
    navigate('/merge', { replace: true })
    return null
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Merge Complete</CardTitle>
          <CardContent className="pt-0">
            <p className="text-muted-foreground">
              Your files have been combined into one dataset.
            </p>
          </CardContent>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Merged File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium">{merged.fileName}</p>
          <p className="text-sm text-muted-foreground">
            {merged.rowCount} rows × {merged.columnCount} columns
          </p>
          {merged.warning && (
            <p className="text-sm text-amber-600 dark:text-amber-400">{merged.warning}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleContinueToTransform} size="lg" className="gap-2">
          Continue to Transform
          <ArrowRight className="h-5 w-5" />
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
