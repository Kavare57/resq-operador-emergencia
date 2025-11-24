type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success'

interface LogEntry {
  timestamp: string
  level: LogLevel
  context: string
  message: string
  data?: any
}

class Logger {
  private logs: LogEntry[] = []
  private isDevelopment = import.meta.env.DEV

  private formatLog(level: LogLevel, context: string, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data,
    }
  }

  private log(entry: LogEntry) {
    this.logs.push(entry)

    if (this.isDevelopment) {
      const prefix = `[${entry.context}] ${entry.message}`
      const colorMap: Record<LogLevel, string> = {
        debug: 'color: #888; font-size: 11px;',
        info: 'color: #0066cc; font-weight: bold;',
        warn: 'color: #ff9900; font-weight: bold;',
        error: 'color: #cc0000; font-weight: bold;',
        success: 'color: #00cc00; font-weight: bold;',
      }

      if (entry.data) {
        console.log(`%c${prefix}`, colorMap[entry.level], entry.data)
      } else {
        console.log(`%c${prefix}`, colorMap[entry.level])
      }
    }
  }

  debug(context: string, message: string, data?: any) {
    this.log(this.formatLog('debug', context, message, data))
  }

  info(context: string, message: string, data?: any) {
    this.log(this.formatLog('info', context, message, data))
  }

  warn(context: string, message: string, data?: any) {
    this.log(this.formatLog('warn', context, message, data))
  }

  error(context: string, message: string, error?: any, data?: any) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    this.log(this.formatLog('error', context, `${message}: ${errorMessage}`, data))
  }

  success(context: string, message: string, data?: any) {
    this.log(this.formatLog('success', context, message, data))
  }

  getLogs(): LogEntry[] {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }
}

export const logger = new Logger()
