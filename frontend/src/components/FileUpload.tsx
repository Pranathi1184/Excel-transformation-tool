import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileSpreadsheet, X } from 'lucide-react'
import { excelApi, type UploadResponse } from '@/lib/api'

interface FileUploadProps {
  onUploadSuccess: (data: UploadResponse) => void
  onError?: (error: string) => void
}

export function FileUpload({ onUploadSuccess, onError }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file)
      } else {
        onError?.('Please select an Excel file (.xlsx or .xls)')
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const response = await excelApi.uploadFile(selectedFile)
      onUploadSuccess(response)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Upload failed'
      onError?.(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload Excel File
        </CardTitle>
        <CardDescription>
          Select an Excel file (.xlsx or .xls) to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label htmlFor="file-upload">
            <Button
              type="button"
              variant="outline"
              asChild
              disabled={isUploading}
            >
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Choose File
              </span>
            </Button>
          </label>
          
          {selectedFile && (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-muted-foreground truncate">
                {selectedFile.name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {selectedFile && (
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full gap-2"
          >
            {isUploading ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="inline-flex"
                >
                  <Upload className="h-4 w-4" />
                </motion.div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload File
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

