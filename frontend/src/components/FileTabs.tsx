import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { type UploadResponse } from '@/lib/api'

interface FileTabsProps {
  files: UploadResponse[]
  activeIndex: number
  onSelectFile: (index: number) => void
  onRemoveFile?: (index: number) => void
}

export function FileTabs({ files, activeIndex, onSelectFile, onRemoveFile }: FileTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 border-b">
      {files.map((file, index) => (
        <div
          key={file.fileId}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-t-lg border-b-2 transition-colors cursor-pointer
            ${index === activeIndex 
              ? 'border-primary bg-primary/5' 
              : 'border-transparent hover:bg-muted/50'
            }
          `}
          onClick={() => onSelectFile(index)}
        >
          <span className="text-sm font-medium whitespace-nowrap">
            {file.fileName}
          </span>
          {onRemoveFile && files.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4"
              onClick={(e) => {
                e.stopPropagation()
                onRemoveFile(index)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

