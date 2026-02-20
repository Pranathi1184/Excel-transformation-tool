/**
 * Non-intrusive product tour with visual mockups (no screenshots).
 * Shows once on first visit; can be restarted from help menu.
 */
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, X, FileSpreadsheet, CheckCircle2, Download, Zap, Merge } from 'lucide-react'
import { toast } from 'sonner'

interface TourStep {
  title: string
  description: string
  mockup: React.ReactNode
  benefits: string[]
}

const UploadMockup = () => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center h-64">
    <FileSpreadsheet className="h-16 w-16 text-primary mb-4 animate-bounce" />
    <p className="text-lg font-semibold text-gray-700">Drop your Excel file here</p>
    <p className="text-sm text-gray-500 mt-2">or click to browse</p>
    <div className="mt-4 text-xs text-gray-400">Supports .xlsx files up to 50MB</div>
  </div>
)

const PreviewMockup = () => (
  <div className="bg-white rounded-lg border shadow-sm">
    <div className="bg-primary text-white p-3 rounded-t-lg">
      <h3 className="font-semibold text-sm">📊 Data Preview - Amazon.xlsx</h3>
    </div>
    <div className="p-4">
      <div className="mb-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded p-2">
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
        <span className="text-sm text-green-700">Data Health: 85/100 - Good Quality</span>
      </div>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">order_id</th>
            <th className="border p-2 text-left">product_category</th>
            <th className="border p-2 text-left">price</th>
            <th className="border p-2 text-left">total_revenue</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="border p-2">1</td><td className="border p-2">Electronics</td><td className="border p-2">$299</td><td className="border p-2">$598</td></tr>
          <tr><td className="border p-2">2</td><td className="border p-2">Books</td><td className="border p-2">$15</td><td className="border p-2">$45</td></tr>
          <tr><td className="border p-2">3</td><td className="border p-2">Clothing</td><td className="border p-2">$49</td><td className="border p-2">$98</td></tr>
        </tbody>
      </table>
      <p className="text-xs text-gray-500 mt-2">Showing 3 of 50,000 rows</p>
    </div>
  </div>
)

const PipelineMockup = () => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <Card className="border-2 hover:border-primary cursor-pointer transition-all">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-2xl">🧹</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm">Data Cleaning</p>
            <p className="text-xs text-gray-500">5 operations</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-2">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-2xl">🔄</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm">Transformation</p>
            <p className="text-xs text-gray-500">6 operations</p>
          </div>
        </CardContent>
      </Card>
    </div>
    <div className="bg-white rounded-lg border p-3 space-y-2">
      <p className="text-xs font-semibold text-gray-600">Current Pipeline (3)</p>
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded p-2">
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
        <span className="text-sm">#1 Filter: price &gt; 200</span>
      </div>
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded p-2">
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
        <span className="text-sm">#2 Math: price × quantity → total</span>
      </div>
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded p-2">
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
        <span className="text-sm">#3 Sort: by revenue desc</span>
      </div>
    </div>
  </div>
)

const ValidationMockup = () => (
  <div className="space-y-3">
    <Card className="border-green-500 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-700">Pipeline is valid!</p>
            <p className="text-sm text-green-600">All 3 operations passed validation</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="bg-white border rounded-lg p-3">
      <p className="text-xs font-semibold mb-2">Validation Details:</p>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <span>✓ All columns exist</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <span>✓ No circular dependencies</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <span>✓ Data types compatible</span>
        </div>
      </div>
    </div>
  </div>
)

const ResultsMockup = () => (
  <div className="space-y-3">
    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">Transformation Complete! 🎉</p>
          <p className="text-2xl font-bold">50,000 → 12,345 rows</p>
          <p className="text-xs opacity-75 mt-1">Filtered and sorted successfully</p>
        </div>
        <Download className="h-12 w-12 opacity-75 shrink-0" />
      </div>
    </div>
    <Button className="w-full" size="lg">
      <Download className="mr-2 h-5 w-5" />
      Download Transformed File
    </Button>
    <p className="text-xs text-center text-gray-500">File ready: Amazon_transformed.xlsx</p>
  </div>
)

const BatchMockup = () => (
  <div className="space-y-3">
    <div className="bg-white border rounded-lg p-3">
      <p className="text-sm font-semibold mb-2">Uploaded Files (3):</p>
      <div className="space-y-1">
        {['Sales_Jan.xlsx', 'Sales_Feb.xlsx', 'Sales_Mar.xlsx'].map((file, i) => (
          <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
            <FileSpreadsheet className="h-4 w-4 text-primary shrink-0" />
            <span className="flex-1 truncate">{file}</span>
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          </div>
        ))}
      </div>
    </div>
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-5 w-5 text-blue-600 shrink-0" />
        <span className="font-semibold text-blue-700 text-sm">Batch Processing</span>
      </div>
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: '66%' }} />
      </div>
      <p className="text-xs text-blue-600 mt-1">Processing file 2 of 3...</p>
    </div>
  </div>
)

const MergeMockup = () => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="border rounded p-2 bg-gray-50">
        <p className="font-semibold mb-1">Sales.xlsx</p>
        <p className="text-xs text-gray-600">Columns: order_id, product_id, quantity</p>
        <p className="text-xs text-gray-500">1,000 rows</p>
      </div>
      <div className="border rounded p-2 bg-gray-50">
        <p className="font-semibold mb-1">Products.xlsx</p>
        <p className="text-xs text-gray-600">Columns: product_id, name, price</p>
        <p className="text-xs text-gray-500">500 rows</p>
      </div>
    </div>
    <div className="flex items-center justify-center">
      <Merge className="h-8 w-8 text-primary" />
    </div>
    <Card className="bg-green-50 border-green-200">
      <CardContent className="p-3">
        <p className="text-sm font-semibold text-green-700 mb-1">Merge Strategy: Join</p>
        <p className="text-xs text-green-600">Join on: product_id</p>
        <p className="text-xs text-gray-600 mt-2">Result: Sales data enriched with product names and prices</p>
      </CardContent>
    </Card>
  </div>
)

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome! 👋',
    description: "Transform Excel files without code. Let's show you around in 2 minutes!",
    mockup: (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold text-primary mb-2">Excel Data Transformation Tool</h3>
        <p className="text-gray-600">No formulas. No coding. Just results.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <p className="font-semibold">50,000+</p>
            <p className="text-xs text-gray-600">Rows processed</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="font-semibold">17</p>
            <p className="text-xs text-gray-600">Operations</p>
          </div>
        </div>
      </div>
    ),
    benefits: [
      '✅ No Excel formulas to learn',
      '✅ Visual pipeline builder',
      '✅ Process thousands of rows instantly',
      '✅ Batch mode for multiple files',
    ],
  },
  {
    title: 'Step 1: Upload',
    description: 'Drag and drop your .xlsx file. We automatically detect headers and preview your data.',
    mockup: <UploadMockup />,
    benefits: ['📁 Files up to 50MB', '🔍 Auto header detection', '👁️ Instant preview', '📊 Data quality check'],
  },
  {
    title: 'Step 2: Preview',
    description: 'See your data with automatic quality insights and column type detection.',
    mockup: <PreviewMockup />,
    benefits: ['📈 Health score (0-100)', '⚠️ Issue detection', '🔢 Column statistics', '💡 Auto recommendations'],
  },
  {
    title: 'Step 3: Build Pipeline',
    description: 'Choose from 17 operations organized by category. Add multiple operations to create your workflow.',
    mockup: <PipelineMockup />,
    benefits: ['🧹 Data Cleaning (5 ops)', '🔄 Transformations (6 ops)', '💰 Financial (3 ops)', '📊 Advanced (3 ops)'],
  },
  {
    title: 'Real-Time Validation',
    description: "See errors before running! Green checkmarks mean you're ready, red X means fix needed.",
    mockup: <ValidationMockup />,
    benefits: ['✅ Instant error detection', '🔧 Auto-fix suggestions', '⚡ Dependency tracking', '💡 Smart recommendations'],
  },
  {
    title: 'Download Results',
    description: 'Preview transformed data, then download. Undo/redo available if you need changes.',
    mockup: <ResultsMockup />,
    benefits: ['👁️ Preview before download', '⏮️ Undo/Redo anytime', '💾 Save pipeline for reuse', '📥 Export as Excel'],
  },
  {
    title: 'Batch Processing',
    description: 'Apply the same pipeline to 100s of files. Download all results as ZIP.',
    mockup: <BatchMockup />,
    benefits: ['📦 Process 100s of files', '⚡ One pipeline for all', '📥 ZIP download', '⏱️ Save hours of work'],
  },
  {
    title: 'Merge Files',
    description: 'Combine multiple files using append, join, or union. Like VLOOKUP but visual!',
    mockup: <MergeMockup />,
    benefits: ['🔗 SQL-style joins', '📚 Append rows', '🎯 Remove duplicates', '💡 No formulas needed'],
  },
  {
    title: "You're Ready! 🚀",
    description:
      "That's everything! Start transforming your data now. You can replay this tour anytime from the help menu.",
    mockup: (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold mb-4">Ready to Transform!</h3>
        <div className="space-y-2 text-left max-w-sm mx-auto">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm">Upload your Excel file to get started</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm">Build pipelines and save them for reuse</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm">Access help anytime from the menu</p>
          </div>
        </div>
      </div>
    ),
    benefits: ['🚀 Start transforming now', '💾 Pipelines auto-saved', '📜 Full history tracking', '🆘 Help always available'],
  },
]

export function ProductTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenProductTour')
    if (!hasSeenTour) {
      const t = setTimeout(() => setIsOpen(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  const markTourSeen = () => {
    localStorage.setItem('hasSeenProductTour', 'true')
  }

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const skipTour = () => {
    setIsOpen(false)
    markTourSeen()
  }

  const completeTour = () => {
    setIsOpen(false)
    markTourSeen()
    toast.success('Tour completed! You can restart it anytime from the help menu.')
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false)
      markTourSeen()
    }
  }

  const step = TOUR_STEPS[currentStep]
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{step.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={skipTour} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Step {currentStep + 1} of {TOUR_STEPS.length}
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-base text-gray-700">{step.description}</p>

          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg border-2">
            {step.mockup}
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 gap-2">
                {step.benefits.map((benefit, i) => (
                  <div key={i} className="text-sm text-gray-700">
                    {benefit}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between mt-4">
          <Button variant="ghost" onClick={skipTour}>
            Skip Tour
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <Button onClick={nextStep}>
              {currentStep === TOUR_STEPS.length - 1 ? (
                'Get Started! 🚀'
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Call to restart the product tour (e.g. from help menu). Reloads so tour shows again. */
export function restartProductTour() {
  localStorage.removeItem('hasSeenProductTour')
  window.location.reload()
}
