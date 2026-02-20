/**
 * First-time guided tour (6 steps) using react-joyride.
 * Auto-starts on first visit; preference stored in localStorage.
 */
import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Joyride, { type CallBackProps, type Step } from 'react-joyride'
import { Button } from '@/components/ui/button'

const TOUR_STORAGE_KEY = 'excel-transform-tool-tour-completed'

export function getTourCompleted(): boolean {
  try {
    return localStorage.getItem(TOUR_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function setTourCompleted(value: boolean): void {
  try {
    if (value) localStorage.setItem(TOUR_STORAGE_KEY, value.toString())
    else localStorage.removeItem(TOUR_STORAGE_KEY)
  } catch { /* ignore localStorage errors */ }
}

const TOUR_STEPS: Step[] = [
  {
    target: '[data-tour="landing-transform-single"]',
    content: 'Start here to transform one Excel file at a time.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="upload-area"]',
    content: 'Drag and drop or click to upload your .xlsx file (max 50MB).',
    disableBeacon: true,
  },
  {
    target: '[data-tour="preview-table"]',
    content: 'Preview your data and verify column headers are detected correctly.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="add-operation"]',
    content: 'Click here to add transformation operations to your pipeline.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="add-operation"]',
    content: 'Operations are organized by category. Choose Data Cleaning, Transformation, Financial, or Advanced.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="validate-pipeline"]',
    content: "Always validate before running. We'll check for errors and suggest fixes.",
    disableBeacon: true,
  },
]

/** Routes to navigate to before showing each step (so target exists). */
const ROUTES_BY_STEP: Record<number, string> = {
  0: '/',
  1: '/upload/single',
  2: '/preview',
  3: '/pipeline',
  4: '/pipeline',
  5: '/pipeline',
}

interface GuidedTourProps {
  run: boolean
  onComplete?: () => void
}

/** Routes where tour steps live; don't run tour on other paths (targets would be missing). */
const TOUR_PATHS = ['/', '/upload/single', '/preview', '/pipeline']

export function GuidedTour({ run, onComplete }: GuidedTourProps) {
  const [running, setRunning] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [domReady, setDomReady] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname

  // Only run tour on landing; stop immediately when user navigates away to avoid Joyride accessing unmounted nodes
  const isTourPath = TOUR_PATHS.some((p) => pathname === p || (p !== '/' && pathname.startsWith(p)))
  const isLanding = pathname === '/'

  useEffect(() => {
    if (!run) return
    if (getTourCompleted()) return
    if (!isLanding) {
      setRunning(false)
      return
    }
    // Wait for DOM to mount before starting tour (avoids "nodeName of null" in react-joyride)
    const timer = setTimeout(() => {
      setDomReady(true)
      setRunning(true)
      setStepIndex(0)
    }, 1500)
    return () => clearTimeout(timer)
  }, [run, isLanding])

  // Stop tour when navigating away from a page that has the current step's target
  useEffect(() => {
    if (!running) return
    const expectedRoute = ROUTES_BY_STEP[stepIndex]
    const routeMatches = expectedRoute === pathname || (expectedRoute !== '/' && pathname.startsWith(expectedRoute))
    if (!routeMatches) {
      setRunning(false)
      onComplete?.()
    }
  }, [pathname, stepIndex, running, onComplete])

  const handleCallback = useCallback(
    (data: CallBackProps) => {
      const { action, index, status } = data
      if (status === 'finished' || status === 'skipped') {
        setRunning(false)
        setTourCompleted(true)
        onComplete?.()
        return
      }
      if (action === 'close') {
        setRunning(false)
        setTourCompleted(true)
        onComplete?.()
        return
      }
      if (action === 'next' && typeof index === 'number') {
        const nextIndex = index + 1
        if (nextIndex < TOUR_STEPS.length) {
          const nextRoute = ROUTES_BY_STEP[nextIndex]
          if (nextRoute && nextRoute !== location.pathname && !location.pathname.startsWith(nextRoute)) {
            navigate(nextRoute)
          }
          setStepIndex(nextIndex)
        }
      }
      if (action === 'prev' && typeof index === 'number' && index > 0) {
        const prevIndex = index - 1
        const prevRoute = ROUTES_BY_STEP[prevIndex]
        if (prevRoute && prevRoute !== location.pathname) {
          navigate(prevRoute)
        }
        setStepIndex(prevIndex)
      }
    },
    [onComplete, navigate, location.pathname]
  )

  // Don't render Joyride on non-tour paths so we never attach to missing elements
  if (!isTourPath || !run) return null
  if (!running && !domReady) return null
  // Safety: only render if current step exists and its target is in the DOM
  const currentStep = TOUR_STEPS[stepIndex]
  if (!currentStep) return null
  const targetSelector = currentStep.target
  const targetMissing =
    typeof targetSelector === 'string' &&
    typeof document !== 'undefined' &&
    !document.querySelector(targetSelector)
  if (targetMissing) return null

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={running}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleCallback}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip tour',
      }}
      styles={{
        options: {
          primaryColor: '#217346',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
          arrowColor: '#fff',
          backgroundColor: '#fff',
          textColor: '#333',
        },
        buttonNext: {
          backgroundColor: '#217346',
        },
        buttonBack: {
          color: '#217346',
        },
        buttonSkip: {
          color: '#666',
        },
      }}
      floaterProps={{
        disableAnimation: false,
      }}
    />
  )
}

/** Button to restart the tour (e.g. from help menu). */
export function RestartTourButton({ onRestart }: { onRestart: () => void }) {
  const handleClick = () => {
    setTourCompleted(false)
    onRestart()
  }
  return (
    <Button variant="ghost" size="sm" onClick={handleClick}>
      Restart Tour
    </Button>
  )
}
