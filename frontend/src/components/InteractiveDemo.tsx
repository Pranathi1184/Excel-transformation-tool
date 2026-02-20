/**
 * Interactive demo (no video): step-through walkthrough with visuals and narration.
 * Use on landing page as "Watch Demo" alternative.
 */
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play, ChevronRight, RotateCcw } from 'lucide-react'

interface DemoStep {
  title: string
  action: string
  visual: React.ReactNode
  narration: string
}

const DEMO_STEPS: DemoStep[] = [
  {
    title: 'Upload File',
    action: 'User drags Amazon.xlsx to upload area',
    narration:
      "First, I'll upload my sales data. Just drag and drop the Excel file...",
    visual: (
      <div className="relative">
        <div className="border-4 border-dashed border-primary/50 rounded-lg p-8 bg-primary/5 animate-pulse">
          <div className="text-center">
            <div className="text-6xl mb-2">📊</div>
            <p className="font-semibold text-primary">Amazon.xlsx</p>
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-4xl animate-bounce">⬇️</div>
        </div>
      </div>
    ),
  },
  {
    title: 'Data Preview',
    action: 'System shows data preview with 50,000 rows',
    narration:
      "Great! The system automatically detected my headers and I can see all 50,000 rows of sales data...",
    visual: (
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded p-3 flex items-center gap-2">
          <div className="text-green-600 text-xl">✓</div>
          <div>
            <p className="font-semibold text-sm text-green-700">Upload Complete!</p>
            <p className="text-xs text-green-600">50,000 rows • 13 columns • Headers detected</p>
          </div>
        </div>
        <div className="border rounded overflow-x-auto">
          <table className="w-full text-xs min-w-[300px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left border">order_id</th>
                <th className="p-2 text-left border">product_category</th>
                <th className="p-2 text-left border">price</th>
                <th className="p-2 text-left border">quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border">1</td>
                <td className="p-2 border">Electronics</td>
                <td className="p-2 border">$299</td>
                <td className="p-2 border">2</td>
              </tr>
              <tr>
                <td className="p-2 border">2</td>
                <td className="p-2 border">Books</td>
                <td className="p-2 border">$15</td>
                <td className="p-2 border">3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    title: 'Add Filter',
    action: 'User adds filter: price > $200',
    narration:
      "I only want high-value sales, so I'll add a filter for prices over $200...",
    visual: (
      <div className="space-y-3">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm font-semibold mb-2">Adding Operation: Filter</p>
          <div className="space-y-2 text-sm">
            <div>
              Column: <span className="font-mono bg-white px-2 py-1 rounded">price</span>
            </div>
            <div>
              Operator: <span className="font-mono bg-white px-2 py-1 rounded">&gt;</span>
            </div>
            <div>
              Value: <span className="font-mono bg-white px-2 py-1 rounded">200</span>
            </div>
          </div>
        </Card>
        <div className="bg-green-50 border border-green-200 rounded p-2 flex items-center gap-2">
          <div className="text-green-600">✓</div>
          <span className="text-sm">#1 Filter: price &gt; 200</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Add Calculation',
    action: 'User adds math: price × quantity = total',
    narration:
      "Now I'll calculate the total by multiplying price and quantity...",
    visual: (
      <div className="space-y-2">
        <div className="bg-green-50 border border-green-200 rounded p-2 flex items-center gap-2">
          <div className="text-green-600">✓</div>
          <span className="text-sm">#1 Filter: price &gt; 200</span>
        </div>
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm font-semibold mb-2">Adding Operation: Math</p>
          <div className="space-y-2 text-sm">
            <div>
              Operation: <span className="font-mono bg-white px-2 py-1 rounded">multiply</span>
            </div>
            <div>
              Column A: <span className="font-mono bg-white px-2 py-1 rounded">price</span>
            </div>
            <div>
              Column B: <span className="font-mono bg-white px-2 py-1 rounded">quantity</span>
            </div>
            <div>
              New Column: <span className="font-mono bg-white px-2 py-1 rounded">total_value</span>
            </div>
          </div>
        </Card>
      </div>
    ),
  },
  {
    title: 'Results',
    action: 'User clicks Run & Preview',
    narration:
      "Perfect! The transformation is complete. I went from 50,000 rows down to 12,345 high-value sales, and added the total_value column. Now I can download the file!",
    visual: (
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">✨ Transformation Complete!</p>
          <p className="text-2xl font-bold">50,000 → 12,345 rows</p>
          <p className="text-xs opacity-75 mt-1">Pipeline: Filter → Math</p>
        </div>
        <div className="border rounded overflow-x-auto">
          <table className="w-full text-xs min-w-[320px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left border">order_id</th>
                <th className="p-2 text-left border">price</th>
                <th className="p-2 text-left border">quantity</th>
                <th className="p-2 text-left border bg-green-100">total_value ✨</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border">1</td>
                <td className="p-2 border">$299</td>
                <td className="p-2 border">2</td>
                <td className="p-2 border bg-green-50">$598</td>
              </tr>
              <tr>
                <td className="p-2 border">5</td>
                <td className="p-2 border">$450</td>
                <td className="p-2 border">3</td>
                <td className="p-2 border bg-green-50">$1,350</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Button className="w-full" size="lg">
          📥 Download Transformed File
        </Button>
      </div>
    ),
  },
]

interface InteractiveDemoProps {
  /** Optional class for the trigger button (e.g. hero styling) */
  className?: string
}

export function InteractiveDemo({ className }: InteractiveDemoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setCurrentStep(0)
    }
  }

  const restart = () => {
    setCurrentStep(0)
  }

  const step = DEMO_STEPS[currentStep]

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          setIsOpen(true)
          setCurrentStep(0)
        }}
        className={className}
      >
        <Play className="mr-2 h-5 w-5" />
        Watch Demo (Interactive)
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Interactive Demo — See It In Action</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold">{step.title}</span>
              <span className="text-muted-foreground">
                Step {currentStep + 1} of {DEMO_STEPS.length}
              </span>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg border-2 min-h-[280px]">
              {step.visual}
            </div>

            <Card className="bg-blue-50 border-blue-200 p-4">
              <p className="text-sm italic text-gray-700">"{step.narration}"</p>
              <p className="text-xs text-gray-500 mt-2">Action: {step.action}</p>
            </Card>

            <div className="flex justify-between items-center pt-4">
              <Button variant="ghost" onClick={restart}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart
              </Button>

              <Button onClick={nextStep} size="lg">
                {currentStep === DEMO_STEPS.length - 1 ? (
                  'Start Over'
                ) : (
                  <>
                    Next Step
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
