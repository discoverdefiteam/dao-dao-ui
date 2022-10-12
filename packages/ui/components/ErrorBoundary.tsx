/* eslint-disable i18next/no-literal-string */
import Link from 'next/link'
import { Component, ErrorInfo, ReactNode } from 'react'
import { WithTranslationProps, withTranslation } from 'react-i18next'

import { ErrorPage } from '@dao-dao/ui'
import { processError } from '@dao-dao/utils'

interface ErrorBoundaryProps extends WithTranslationProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: string
}

// React does not have functional Error Boundaries yet
class ErrorBoundaryInner extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: processError(error) }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  render() {
    return this.state.hasError ? (
      <ErrorPage
        title={
          this.props.i18n?.t?.('error.unexpectedError') ??
          'An unexpected error occurred.'
        }
      >
        <p>
          {this.props.i18n?.t?.('error.checkInternetOrTryAgain') ??
            'Check your internet connection or try again later.'}{' '}
          <Link href="/home">
            <a className="underline hover:no-underline">
              {this.props.i18n?.t?.('info.considerReturningHome') ??
                'Consider returning home.'}
            </a>
          </Link>
        </p>

        {!!this.state.error && (
          <pre className="mt-6 text-xs text-error whitespace-pre-wrap">
            {this.state.error}
          </pre>
        )}
      </ErrorPage>
    ) : (
      this.props.children
    )
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryInner)
