import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet } from 'lucide-react'

interface SheetListProps {
  sheets: string[]
  currentSheet?: string
  onSheetSelect: (sheetName: string) => void
  fileId?: string
}

export function SheetList({ sheets, currentSheet, onSheetSelect }: SheetListProps) {
  if (sheets.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Sheets ({sheets.length})
        </CardTitle>
        <CardDescription>
          Select a sheet to preview its data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {sheets.map((sheet) => (
            <Button
              key={sheet}
              variant={currentSheet === sheet ? 'default' : 'outline'}
              onClick={() => onSheetSelect(sheet)}
            >
              {sheet}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

