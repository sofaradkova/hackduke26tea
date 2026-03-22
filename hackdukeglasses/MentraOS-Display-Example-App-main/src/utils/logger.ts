type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_RANK: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function toErrorMessage(value: unknown): string {
  if (value instanceof Error) return value.message;
  return String(value);
}

function serializeMeta(meta: unknown): string {
  if (meta === undefined) return '';
  try {
    return JSON.stringify(meta);
  } catch (error) {
    return JSON.stringify({ serializationError: toErrorMessage(error) });
  }
}

export function createLogger(scope: string, configuredLevel: string = 'info') {
  const normalizedLevel = (configuredLevel.toLowerCase() as Level);
  const threshold = LEVEL_RANK[normalizedLevel] ?? LEVEL_RANK.info;

  function write(level: Level, message: string, meta?: unknown): void {
    if (LEVEL_RANK[level] < threshold) return;
    const timestamp = new Date().toISOString();
    const suffix = meta === undefined ? '' : ` ${serializeMeta(meta)}`;
    const line = `[${timestamp}] [${level.toUpperCase()}] [${scope}] ${message}${suffix}`;

    if (level === 'warn') {
      console.warn(line);
      return;
    }
    if (level === 'error') {
      console.error(line);
      return;
    }
    console.log(line);
  }

  return {
    debug(message: string, meta?: unknown): void {
      write('debug', message, meta);
    },
    info(message: string, meta?: unknown): void {
      write('info', message, meta);
    },
    warn(message: string, meta?: unknown): void {
      write('warn', message, meta);
    },
    error(message: string, meta?: unknown): void {
      write('error', message, meta);
    },
  };
}
