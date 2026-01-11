/**
 * Debug Logger Utility
 * Provides consistent logging with levels and optional server reporting
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    data?: unknown;
    timestamp: string;
    url: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

class DebugLogger {
    private minLevel: LogLevel = import.meta.env.DEV ? 'debug' : 'warn';
    private logs: LogEntry[] = [];
    private maxLogs = 100;

    setMinLevel(level: LogLevel) {
        this.minLevel = level;
    }

    private shouldLog(level: LogLevel): boolean {
        return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
    }

    private formatMessage(level: LogLevel, message: string): string {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        return `${prefix} ${message}`;
    }

    private addToHistory(entry: LogEntry) {
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
    }

    debug(message: string, data?: unknown) {
        if (this.shouldLog('debug')) {
            console.debug(this.formatMessage('debug', message), data ?? '');
            this.addToHistory({
                level: 'debug',
                message,
                data,
                timestamp: new Date().toISOString(),
                url: window.location.href,
            });
        }
    }

    info(message: string, data?: unknown) {
        if (this.shouldLog('info')) {
            console.info(this.formatMessage('info', message), data ?? '');
            this.addToHistory({
                level: 'info',
                message,
                data,
                timestamp: new Date().toISOString(),
                url: window.location.href,
            });
        }
    }

    warn(message: string, data?: unknown) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message), data ?? '');
            this.addToHistory({
                level: 'warn',
                message,
                data,
                timestamp: new Date().toISOString(),
                url: window.location.href,
            });
        }
    }

    error(message: string, error?: Error | unknown) {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message), error ?? '');

            const entry: LogEntry = {
                level: 'error',
                message,
                data: error instanceof Error ? { message: error.message, stack: error.stack } : error,
                timestamp: new Date().toISOString(),
                url: window.location.href,
            };

            this.addToHistory(entry);

            // Report critical errors to server
            this.reportToServer(entry);
        }
    }

    private async reportToServer(entry: LogEntry) {
        try {
            await fetch('/api/error-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...entry,
                    userAgent: navigator.userAgent,
                }),
            });
        } catch {
            // Silently fail
        }
    }

    getHistory(): LogEntry[] {
        return [...this.logs];
    }

    clearHistory() {
        this.logs = [];
    }

    // API request helper with logging
    async fetchWithLogging<T>(url: string, options?: RequestInit): Promise<T> {
        const startTime = performance.now();
        this.debug(`API Request: ${options?.method || 'GET'} ${url}`);

        try {
            const response = await fetch(url, options);
            const duration = Math.round(performance.now() - startTime);

            if (!response.ok) {
                const errorText = await response.text();
                this.error(`API Error: ${response.status} ${url} (${duration}ms)`, {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText,
                });
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            this.info(`API Success: ${response.status} ${url} (${duration}ms)`);
            return response.json();
        } catch (error) {
            const duration = Math.round(performance.now() - startTime);
            this.error(`API Failed: ${url} (${duration}ms)`, error);
            throw error;
        }
    }
}

// Singleton instance
export const logger = new DebugLogger();

// Global error handlers
if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        logger.error('Uncaught error', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        logger.error('Unhandled promise rejection', event.reason);
    });
}

export default logger;
