export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export interface LogContext {
  organizationId?: string;
  projectId?: string;
  analysisRunId?: string;
  workflowId?: string;
  stepId?: string;
  attempt?: number;
  providerJobId?: string;
  correlationId?: string;
  [key: string]: unknown;
}

export class Logger {
  private level: LogLevel;
  private context: LogContext;

  constructor(level: LogLevel = "info", context: LogContext = {}) {
    this.level = level;
    this.context = sanitizeContext(context);
  }

  public child(extraContext: LogContext): Logger {
    return new Logger(this.level, { ...this.context, ...sanitizeContext(extraContext) });
  }

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public debug(message: string, data?: Record<string, unknown>): void {
    this.log("debug", message, data);
  }

  public info(message: string, data?: Record<string, unknown>): void {
    this.log("info", message, data);
  }

  public warn(message: string, data?: Record<string, unknown>): void {
    this.log("warn", message, data);
  }

  public error(message: string, data?: Record<string, unknown>, error?: unknown): void {
    const errorDetails =
      error instanceof Error
        ? {
            errorName: error.name,
            errorMessage: error.message,
            stack: error.stack,
          }
        : error !== undefined
          ? { rawError: String(error) }
          : undefined;

    this.log("error", message, { ...data, ...errorDetails });
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (LOG_LEVEL_SEVERITY[level] < LOG_LEVEL_SEVERITY[this.level]) {
      return;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      context: this.context,
      ...(data ? { data: sanitizeData(data) } : {}),
    };

    const serialized = JSON.stringify(entry);
    if (level === "error") {
      console.error(serialized);
    } else if (level === "warn") {
      console.warn(serialized);
    } else {
      console.info(serialized);
    }
  }
}

/**
 * Ensures forbidden fields (matrix vectors, raw cell data) are never included in structured logs.
 */
function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    // Prohibit large arrays or raw expression matrices
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("matrix") ||
      lowerKey.includes("expression") ||
      lowerKey.includes("counts") ||
      lowerKey.includes("genes") ||
      lowerKey.includes("barcodes")
    ) {
      sanitized[key] = "[REDACTED_SCIENTIFIC_CONTENT]";
    } else if (Array.isArray(value) && value.length > 50) {
      sanitized[key] = `[ARRAY_TRUNCATED_LENGTH_${value.length}]`;
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function sanitizeContext(context: LogContext): LogContext {
  const sanitized: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = new Logger((process.env.LOG_LEVEL as LogLevel | undefined) || "info");
