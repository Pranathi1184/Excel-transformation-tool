/**
 * Merge Files: strategy selector, join config, preview, export.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MergeConfig } from '@/components/MergeConfig'
import { useApp } from '@/context/AppContext'
import { toast } from 'sonner'
import type { MergeFilesResponse } from '@/lib/api'

export function MergePage() {
  const navigate = useNavigate()
  const { multipleFiles } = useApp()

  useEffect(() => {
    if (!multipleFiles.length) {
      navigate('/upload/merge', { replace: true })
    }
  }, [multipleFiles.length, navigate])

  const handleMergeSuccess = (merged: MergeFilesResponse) => {
    toast.success('Files merged')
    navigate('/merge/results', { state: { merged } })
  }

  const handleError = (message: string) => {
    toast.error(message)
  }

  if (!multipleFiles.length) return null

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <MergeConfig
        files={multipleFiles}
        onMergeSuccess={handleMergeSuccess}
        onError={handleError}
      />
    </div>
  )
}
