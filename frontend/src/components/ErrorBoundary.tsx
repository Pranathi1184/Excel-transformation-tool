/**
 * Error boundary: shows ErrorRecovery (friendly error UI with actions and technical details).
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorRecovery, getFriendlyError } from '@/components/ErrorRecovery'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback
      const error = this.state.error
      const { title, message } = getFriendlyError(error)
      return (
        <ErrorRecovery
          title={title}
          message={message}
          technicalDetails={error.message}
          onRetry={() => this.setState({ hasError: false, error: null })}
          onGoBack={() => { window.location.href = '/' }}
        />
      )
    }
    return this.props.children
  }
}
