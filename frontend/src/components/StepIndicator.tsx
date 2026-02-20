import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  number: number
  label: string
  completed: boolean
  active: boolean
}

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps: Step[] = [
    { number: 1, label: 'Upload', completed: currentStep > 1, active: currentStep === 1 },
    { number: 2, label: 'Preview Sheet', completed: currentStep > 2, active: currentStep === 2 },
    { number: 3, label: 'Configure Transformations', completed: false, active: false },
    { number: 4, label: 'Download Result', completed: false, active: false },
  ]

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                step.completed
                  ? 'bg-[#217346] text-white'
                  : step.active
                  ? 'bg-[#217346] text-white'
                  : 'bg-gray-200 text-gray-600'
              )}
            >
              {step.completed ? (
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  {step.label}
                </span>
              ) : (
                <span>{step.label}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="w-2 h-2 mx-1">
                <svg className="w-2 h-2 text-gray-400" fill="currentColor" viewBox="0 0 8 8">
                  <path d="M2.5 0L5 2.5L2.5 5H0V0H2.5Z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

