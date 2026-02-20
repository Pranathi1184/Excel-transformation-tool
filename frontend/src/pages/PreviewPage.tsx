/**
 * Preview & Configure: sheet selector and data preview.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PreviewSection } from '@/components/PreviewSection'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { ArrowRight } from 'lucide-react'

export function PreviewPage() {
  const navigate = useNavigate()
  const { uploadData, selectedSheet, setSelectedSheet } = useApp()

  useEffect(() => {
    if (!uploadData) {
      navigate('/upload/single', { replace: true })
    }
  }, [uploadData, navigate])

  if (!uploadData) return null

  const initialSheet = uploadData.sheets.includes(selectedSheet) ? selectedSheet : uploadData.sheets[0] || ''
  console.log('PreviewPage fileId:', uploadData.fileId, 'sheetName:', initialSheet)

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <PreviewSection
        fileId={uploadData.fileId}
        fileName={uploadData.fileName}
        sheets={uploadData.sheets}
        initialSheet={initialSheet}
        onSheetChange={setSelectedSheet}
      />
      <div className="flex justify-end">
        <Button onClick={() => navigate('/pipeline')} size="lg" className="gap-2">
          Next: Build Pipeline
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
