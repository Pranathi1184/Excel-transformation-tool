import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { FileSpreadsheet, GitMerge, Zap } from 'lucide-react'

export type ProcessingMode = 'separate' | 'merge' | 'batch'

interface ModeSelectorProps {
  fileCount: number
  onModeSelect: (mode: ProcessingMode) => void
  onCancel?: () => void
}

export function ModeSelector({ fileCount, onModeSelect, onCancel }: ModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<ProcessingMode | null>(null)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Choose Processing Mode
        </CardTitle>
        <CardDescription>
          {fileCount} file{fileCount !== 1 ? 's' : ''} uploaded. How would you like to process them?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedMode || undefined} onValueChange={(value) => setSelectedMode(value as ProcessingMode)}>
          <div className="flex items-start space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="separate" id="separate" className="mt-1" />
            <Label htmlFor="separate" className="flex-1 cursor-pointer">
              <div className="font-semibold mb-1">Process Separately</div>
              <div className="text-sm text-muted-foreground">
                Each file has its own independent pipeline. Switch between files using tabs.
              </div>
            </Label>
          </div>

          <div className="flex items-start space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="merge" id="merge" className="mt-1" />
            <Label htmlFor="merge" className="flex-1 cursor-pointer">
              <div className="font-semibold mb-1 flex items-center gap-2">
                <GitMerge className="h-4 w-4" />
                Merge/Join Files
              </div>
              <div className="text-sm text-muted-foreground">
                Combine multiple files into one dataset. Choose append rows, join by column, or union.
              </div>
            </Label>
          </div>

          <div className="flex items-start space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="batch" id="batch" className="mt-1" />
            <Label htmlFor="batch" className="flex-1 cursor-pointer">
              <div className="font-semibold mb-1 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Batch Process
              </div>
              <div className="text-sm text-muted-foreground">
                Apply the same transformation pipeline to all files. Download all results as ZIP or individually.
              </div>
            </Label>
          </div>
        </RadioGroup>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => selectedMode && onModeSelect(selectedMode)}
            disabled={!selectedMode}
            className="flex-1"
          >
            Continue
          </Button>
          {onCancel && (
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

