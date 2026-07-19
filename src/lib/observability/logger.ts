type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  time: string
  msg: string
  [key: string]: unknown
}

class ConsoleLogger {
  private requestId?: string

  constructor(requestId?: string) {
    this.requestId = requestId
  }

  private log(level: LogLevel, obj: Record<string, unknown>, msg: string) {
    const entry: LogEntry = {
      level,
      time: new Date().toISOString(),
      msg,
      ...obj,
    }
    if (this.requestId) {
      entry.requestId = this.requestId
    }
    const output = JSON.stringify(entry)
    switch (level) {
      case 'error':
        console.error(output)
        break
      case 'warn':
        console.warn(output)
        break
      default:
        console.log(output)
    }
  }

  debug(obj: Record<string, unknown> | string, msg?: string) {
    if (typeof obj === 'string') {
      this.log('debug', {}, obj)
    } else {
      this.log('debug', obj, msg || '')
    }
  }

  info(obj: Record<string, unknown> | string, msg?: string) {
    if (typeof obj === 'string') {
      this.log('info', {}, obj)
    } else {
      this.log('info', obj, msg || '')
    }
  }

  warn(obj: Record<string, unknown> | string, msg?: string) {
    if (typeof obj === 'string') {
      this.log('warn', {}, obj)
    } else {
      this.log('warn', obj, msg || '')
    }
  }

  error(obj: Record<string, unknown> | string, msg?: string) {
    if (typeof obj === 'string') {
      this.log('error', {}, obj)
    } else {
      this.log('error', obj, msg || '')
    }
  }

  child(extra: Record<string, unknown>): ConsoleLogger {
    return new ConsoleLogger(this.requestId || extra.requestId as string | undefined)
  }
}

export function createLogger(requestId?: string): ConsoleLogger {
  return new ConsoleLogger(requestId)
}

export type Logger = ConsoleLogger
