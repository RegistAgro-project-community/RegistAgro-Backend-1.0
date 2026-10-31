export interface Logger {
  info(event: string, context?: Record<string, string | number | boolean>): void;
  error(event: string, context?: Record<string, string | number | boolean>): void;
}

/** Structured logger intentionally accepts only allowlisted scalar context. */
export class ConsoleLogger implements Logger {
  info(event: string, context: Record<string, string | number | boolean> = {}): void {
    process.stdout.write(`${JSON.stringify({ level: "info", event, ...context })}\n`);
  }

  error(event: string, context: Record<string, string | number | boolean> = {}): void {
    process.stderr.write(`${JSON.stringify({ level: "error", event, ...context })}\n`);
  }
}
