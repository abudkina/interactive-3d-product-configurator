import { Component, type ErrorInfo, type ReactNode } from 'react'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message:
        error.message ||
        'Произошла непредвиденная ошибка. Обновите страницу.',
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('Сбой интерфейса', { error: error.message, info })
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal">
          <h1>Что-то пошло не так</h1>
          <p>{this.state.message}</p>
          <button
            type="button"
            className="btn btn-primary"
            aria-label="Обновить страницу"
            onClick={() => window.location.reload()}
          >
            Обновить страницу
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
