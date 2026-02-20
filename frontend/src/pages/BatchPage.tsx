/**
 * Batch Processing: shared pipeline, process all files, download ZIP.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BatchProcessor } from '@/components/BatchProcessor'
import { useApp } from '@/context/AppContext'
import { toast } from 'sonner'
import type { BatchTransformResponse } from '@/lib/api'

export function BatchPage() {
  const navigate = useNavigate()
  const { multipleFiles } = useApp()

  useEffect(() => {
    if (!multipleFiles.length) {
      navigate('/upload/batch', { replace: true })
    }
  }, [multipleFiles.length, navigate])

  const handleError = (message: string) => {
    toast.error(message)
  }

  const handleBatchSuccess = (result: BatchTransformResponse) => {
    navigate('/batch/results', { state: { result } })
  }

  if (!multipleFiles.length) return null

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <BatchProcessor files={multipleFiles} onError={handleError} onSuccess={handleBatchSuccess} />
    </div>
  )
}
