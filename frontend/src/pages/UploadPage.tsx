/**
 * Upload: /upload/single (one file) | /upload/batch (multiple → batch) | /upload/merge (multiple → merge).
 * Batch and merge go directly to their configure pages after upload; no mode selector.
 */
import { useParams, useNavigate } from 'react-router-dom'
import { UploadSection } from '@/components/UploadSection'
import { useApp } from '@/context/AppContext'
import { toast } from 'sonner'

export function UploadPage() {
  const { mode } = useParams<{ mode: string }>()
  const navigate = useNavigate()
  const { onSingleUpload, onMultipleUpload } = useApp()

  const isSingle = mode === 'single'
  const isBatch = mode === 'batch'
  const isMerge = mode === 'merge'

  const handleUploadSuccess = (data: { fileId: string; fileName: string; sheets: string[] }) => {
    onSingleUpload(data)
    toast.success('File uploaded')
    navigate('/preview')
  }

  const handleMultipleUploadSuccess = (data: { files: Array<{ fileId: string; fileName: string; sheets: string[] }> }) => {
    onMultipleUpload(data)
    if (isBatch) {
      toast.success(`${data.files.length} file(s) uploaded for batch processing`)
      navigate('/batch')
    } else if (isMerge) {
      if (data.files.length < 2) {
        toast.error('Merge requires at least 2 files')
        return
      }
      toast.success(`${data.files.length} files uploaded for merge`)
      navigate('/merge')
    } else {
      if (data.files.length === 1) {
        onSingleUpload(data.files[0])
        toast.success('File uploaded')
        navigate('/preview')
      }
    }
  }

  const handleError = (message: string) => {
    toast.error(message)
  }

  const pageTitle = isSingle
    ? 'Transform Single File'
    : isBatch
      ? 'Batch Process Files'
      : isMerge
        ? 'Merge Multiple Files'
        : 'Upload Excel'
  const pageDescription = isSingle
    ? 'Upload one Excel file to preview, build a pipeline, and download the result.'
    : isBatch
      ? 'Upload multiple Excel files. The same transformation pipeline will be applied to all files; download as ZIP.'
      : isMerge
        ? 'Upload at least two Excel files to combine into one (append rows, join by column, or union).'
        : 'Select or drag and drop Excel files.'

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{pageTitle}</h1>
        <p className="text-muted-foreground mt-1">{pageDescription}</p>
      </div>
      <UploadSection
        onUploadSuccess={handleUploadSuccess}
        onMultipleUploadSuccess={handleMultipleUploadSuccess}
        onError={handleError}
        allowMultiple={!isSingle}
      />
    </div>
  )
}
