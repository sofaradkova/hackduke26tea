import fs from 'fs';
import path from 'path';
import type { AppConfig, MentraViewType } from '../types/app';

const DEFAULT_PORT = 3001;
const DEFAULT_CLASSES_POLL_MS = 60_000;
const DEFAULT_ALERTS_POLL_MS = 5_000;
const DEFAULT_SUMMARY_POLL_MS = 10_000;
const DEFAULT_STUDENTS_POLL_MS = 15_000;
const DEFAULT_REQUEST_TIMEOUT_MS = 8_000;

function loadEnvFile(): void {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;

    const [keyRaw, ...valueParts] = line.split('=');
    const key = keyRaw.trim();
    const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');

    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function mustEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not set in .env file`);
  }
  return value;
}

function parseNumber(input: string | undefined, fallback: number, min: number): number {
  const parsed = Number.parseInt(input || '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, parsed);
}

function parseViewType(input: string | undefined): MentraViewType {
  const value = (input || 'PINNED').trim().toUpperCase();
  if (value === 'MAIN' || value === 'PINNED' || value === 'DEFAULT') {
    return value;
  }
  return 'PINNED';
}

function normalizeBaseUrl(input: string): string {
  return input.replace(/\/+$/, '');
}

export function getConfig(): AppConfig {
  loadEnvFile();

  return {
    packageName: mustEnv('PACKAGE_NAME'),
    mentraApiKey: mustEnv('MENTRAOS_API_KEY'),
    classwatchBaseUrl: normalizeBaseUrl(mustEnv('CLASSWATCH_BASE_URL')),
    port: parseNumber(process.env.PORT, DEFAULT_PORT, 1),
    defaultClassId: process.env.DEFAULT_CLASS_ID?.trim() || null,
    pollClassesMs: parseNumber(process.env.POLL_CLASSES_MS, DEFAULT_CLASSES_POLL_MS, 1_000),
    pollAlertsMs: parseNumber(process.env.POLL_ALERTS_MS, DEFAULT_ALERTS_POLL_MS, 1_000),
    pollSummaryMs: parseNumber(process.env.POLL_SUMMARY_MS, DEFAULT_SUMMARY_POLL_MS, 1_000),
    pollStudentsMs: parseNumber(process.env.POLL_STUDENTS_MS, DEFAULT_STUDENTS_POLL_MS, 1_000),
    requestTimeoutMs: parseNumber(process.env.REQUEST_TIMEOUT_MS, DEFAULT_REQUEST_TIMEOUT_MS, 1_000),
    logLevel: (process.env.LOG_LEVEL || 'info').trim().toLowerCase(),
    mentraViewType: parseViewType(process.env.MENTRA_VIEW_TYPE),
  };
}
