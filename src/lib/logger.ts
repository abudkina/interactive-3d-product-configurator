/**
 * Простой логгер без console.log в продакшене.
 * В тестах и разработке пишет через console.warn / console.error.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

const isDev = import.meta.env.DEV

function emit(level: LogLevel, message: string, details?: unknown): void {
  if (!isDev && level === 'debug') return

  const payload = details === undefined ? message : `${message} ${safeStringify(details)}`

  switch (level) {
    case 'error':
      console.error(`[конфигуратор] ${payload}`)
      break
    case 'warn':
      console.warn(`[конфигуратор] ${payload}`)
      break
    case 'info':
    case 'debug':
      if (isDev) {
        // Используем warn, чтобы не оставлять console.log в коде
        console.warn(`[конфигуратор:${level}] ${payload}`)
      }
      break
  }
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export const logger = {
  info: (message: string, details?: unknown) => emit('info', message, details),
  warn: (message: string, details?: unknown) => emit('warn', message, details),
  error: (message: string, details?: unknown) => emit('error', message, details),
  debug: (message: string, details?: unknown) => emit('debug', message, details),
}
