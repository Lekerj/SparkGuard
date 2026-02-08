import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Catches render errors in child tree and shows a fallback UI
 * instead of crashing the entire page.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-xl border border-red-500/30 text-center">
            <div>
              <p className="text-red-400 font-semibold mb-2">Component failed to load</p>
              <p className="text-neutral-400 text-sm">{this.state.error?.message}</p>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}
