import express from 'express';
import { AppServer, AppSession, ViewType } from '@mentra/sdk';
import { getConfig } from './config';
import { DisplayService } from './services/display-service';
import { PollingCoordinator } from './services/polling-coordinator';
import { SessionManager } from './services/session-manager';
import { ClasswatchApiClient } from './services/classwatch-api';
import type { ScreenName } from './types/session';
import { createLogger } from './utils/logger';

const config = getConfig();
const logger = createLogger('ClassWatchMentra', config.logLevel);
const displayService = new DisplayService();
const sessionManager = new SessionManager();
const apiClient = new ClasswatchApiClient(config);
const pollingCoordinator = new PollingCoordinator(config, apiClient);

function selectedViewType(): ViewType {
  if (config.mentraViewType === 'MAIN') return ViewType.MAIN;
  return ViewType.DASHBOARD;
}

function buildEndpoint(path: string): string {
  return `http://localhost:${config.port}${path}`;
}

function renderWebviewHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ClassWatch Live</title>
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #0b1020;
        color: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 24px;
      }
      .card {
        max-width: 720px;
        width: 100%;
        background: #121a33;
        border: 1px solid #233056;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
      }
      h1 {
        margin-top: 0;
        font-size: 28px;
      }
      code {
        background: #0b1020;
        padding: 2px 6px;
        border-radius: 6px;
      }
      .muted {
        color: #cbd5e1;
      }
      ul {
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>ClassWatch Live</h1>
      <p class="muted">Your Mentra MiniApp server is alive. This webview exists so Mentra does not smack you with a useless 404.</p>
      <ul>
        <li>App health: <code>/api/health</code></li>
        <li>Session debug: <code>/api/session/list</code></li>
        <li>Cache debug: <code>/api/cache</code></li>
        <li>Data source: <code>${config.classwatchBaseUrl}</code></li>
      </ul>
      <p class="muted">If glasses are connected, the live display logic is running through the Mentra session/webhook flow, not this web page.</p>
    </div>
  </body>
</html>`;
}

function normalizeTranscript(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

function classIdFromTranscript(normalized: string): string | null {
  const match = normalized.match(/class\s+([a-z0-9-]+)/i);
  return match?.[1] || null;
}

class ClassWatchMentraApp extends AppServer {
  private readonly sessions = new Map<string, AppSession>();
  private readonly renderTicker: ReturnType<typeof setInterval>;

  constructor() {
    super({
      packageName: config.packageName,
      apiKey: config.mentraApiKey,
      port: config.port,
    });

    pollingCoordinator.start();
    this.renderTicker = setInterval(() => {
      this.renderAllSessions();
    }, 1_000);

    this.registerRoutes();
  }

  protected async onSession(session: AppSession, sessionId: string, userId: string): Promise<void> {
    this.sessions.set(sessionId, session);
    sessionManager.connect(sessionId, userId, config.defaultClassId);

    logger.info('Session connected', { sessionId, userId });

    session.layouts.showTextWall(displayService.readyMessage(), {
      view: selectedViewType(),
      durationMs: undefined,
    });

    await pollingCoordinator.refreshClasses();
    const current = sessionManager.ensureClassSelection(
      sessionId,
      pollingCoordinator.getClasses().data,
      config.defaultClassId,
    );

    if (current?.selectedClassId) {
      await pollingCoordinator.forceRefreshClass(current.selectedClassId);
      this.chooseBestScreen(sessionId);
    }

    this.renderSession(sessionId, 'session_start');

    session.events.onTranscription((data) => {
      if (!data.isFinal || !data.text?.trim()) return;
      this.handleTranscript(sessionId, data.text);
    });

    session.events.onGlassesBattery((data) => {
      logger.debug('Battery event', { sessionId, data });
    });
  }

  protected async onStop(sessionId: string, userId: string, reason: string): Promise<void> {
    logger.info('Session stopped', { sessionId, userId, reason });
    this.sessions.delete(sessionId);
    sessionManager.disconnect(sessionId);

    if (this.sessions.size === 0) {
      logger.info('No active sessions remain');
    }
  }

  private registerRoutes(): void {
    const app = this.getExpressApp();
    app.disable('etag');
    app.use(express.json({ limit: '1mb' }));

    app.get('/', (_req, res) => {
      res.status(200).json({
        name: 'ClassWatch MentraOS Live Glasses App',
        status: 'ok',
        endpoints: {
          health: buildEndpoint('/api/health'),
          sessions: buildEndpoint('/api/session/list'),
          cache: buildEndpoint('/api/cache'),
          render: buildEndpoint('/api/render'),
          resolve: buildEndpoint('/api/action/resolve'),
          selectClass: buildEndpoint('/api/action/select-class'),
          screen: buildEndpoint('/api/action/screen'),
          webview: buildEndpoint('/webview'),
        },
      });
    });

    app.get(['/webview', '/webview/'], (_req, res) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(renderWebviewHtml());
    });

    app.get('/api/health', (_req, res) => {
      res.status(200).json({
        status: 'ok',
        service: 'classwatch-mentra',
        port: config.port,
        activeSessions: this.sessions.size,
        classwatchBaseUrl: config.classwatchBaseUrl,
        timestamp: new Date().toISOString(),
      });
    });

    app.get('/api/session/list', (_req, res) => {
      res.status(200).json({
        count: this.sessions.size,
        sessions: sessionManager.debugView(),
      });
    });

    app.get('/api/cache', (_req, res) => {
      res.status(200).json(pollingCoordinator.debugView());
    });

    app.post('/api/render', (req, res) => {
      const sessionId = String(req.body?.sessionId || '').trim();
      if (!sessionId) {
        res.status(400).json({ error: 'sessionId is required' });
        return;
      }

      this.renderSession(sessionId, 'manual_render');
      res.status(200).json({ ok: true, sessionId });
    });

    app.post('/api/action/select-class', async (req, res) => {
      const sessionId = String(req.body?.sessionId || '').trim();
      const classId = String(req.body?.classId || '').trim();

      if (!sessionId || !classId) {
        res.status(400).json({ error: 'sessionId and classId are required' });
        return;
      }

      const session = sessionManager.setSelectedClass(sessionId, classId);
      if (!session) {
        res.status(404).json({ error: 'session not found' });
        return;
      }

      await pollingCoordinator.forceRefreshClass(classId);
      this.chooseBestScreen(sessionId);
      this.renderSession(sessionId, 'select_class');
      res.status(200).json({ ok: true, sessionId, classId, session });
    });

    app.post('/api/action/screen', (req, res) => {
      const sessionId = String(req.body?.sessionId || '').trim();
      const screen = String(req.body?.screen || '').trim() as ScreenName;
      const valid = ['classes', 'alerts', 'summary', 'students'].includes(screen);

      if (!sessionId || !valid) {
        res.status(400).json({ error: 'Valid sessionId and screen are required' });
        return;
      }

      const session = sessionManager.setScreen(sessionId, screen);
      if (!session) {
        res.status(404).json({ error: 'session not found' });
        return;
      }

      this.renderSession(sessionId, 'set_screen');
      res.status(200).json({ ok: true, sessionId, screen });
    });

    app.post('/api/action/resolve', async (req, res) => {
      const sessionId = String(req.body?.sessionId || '').trim();
      const classId = String(req.body?.classId || '').trim();
      const studentId = String(req.body?.studentId || '').trim();

      if (!sessionId || !classId || !studentId) {
        res.status(400).json({ error: 'sessionId, classId, and studentId are required' });
        return;
      }

      try {
        const response = await pollingCoordinator.resolveStudent(classId, studentId);
        this.chooseBestScreen(sessionId);
        this.renderSession(sessionId, 'resolve_student');
        res.status(200).json({ ok: true, sessionId, classId, studentId, response });
      } catch (error) {
        logger.error('Resolve action failed', { sessionId, classId, studentId, error: String(error) });
        res.status(500).json({ error: 'resolve_failed', detail: String(error) });
      }
    });
  }

  private handleTranscript(sessionId: string, text: string): void {
    const normalized = normalizeTranscript(text);
    logger.info('Transcript command candidate', { sessionId, text });

    if (normalized.includes('next screen') || normalized === 'next') {
      sessionManager.nextScreen(sessionId);
      this.renderSession(sessionId, 'voice_next_screen');
      return;
    }

    if (normalized.includes('show alerts')) {
      sessionManager.setScreen(sessionId, 'alerts');
      this.renderSession(sessionId, 'voice_show_alerts');
      return;
    }

    if (normalized.includes('show summary')) {
      sessionManager.setScreen(sessionId, 'summary');
      this.renderSession(sessionId, 'voice_show_summary');
      return;
    }

    if (normalized.includes('show students') || normalized.includes('show roster')) {
      sessionManager.setScreen(sessionId, 'students');
      this.renderSession(sessionId, 'voice_show_students');
      return;
    }

    const requestedClassId = classIdFromTranscript(normalized);
    if (requestedClassId) {
      void this.selectClassFromVoice(sessionId, requestedClassId);
    }
  }

  private async selectClassFromVoice(sessionId: string, classId: string): Promise<void> {
    const classes = pollingCoordinator.getClasses().data?.classes || [];
    const target = classes.find((entry) => entry.id.toLowerCase() === classId.toLowerCase());
    if (!target) return;

    sessionManager.setSelectedClass(sessionId, target.id);
    await pollingCoordinator.forceRefreshClass(target.id);
    this.chooseBestScreen(sessionId);
    this.renderSession(sessionId, 'voice_select_class');
  }

  private chooseBestScreen(sessionId: string): void {
    const state = sessionManager.get(sessionId);
    if (!state?.selectedClassId) return;

    const alerts = pollingCoordinator.getAlerts(state.selectedClassId)?.data?.alerts || [];
    if (alerts.length > 0) {
      sessionManager.setScreen(sessionId, 'alerts');
      return;
    }

    sessionManager.setScreen(sessionId, 'summary');
  }

  private renderAllSessions(): void {
    for (const sessionId of this.sessions.keys()) {
      this.maybeAdvanceRotation(sessionId);
      this.renderSession(sessionId, 'tick');
    }
  }

  private maybeAdvanceRotation(sessionId: string): void {
    const state = sessionManager.get(sessionId);
    if (!state?.selectedClassId) return;

    const now = Date.now();

    if (state.activeScreen === 'alerts') {
      const shouldRotateAlert = state.lastAlertRotationAt === null || now - state.lastAlertRotationAt >= 6_000;
      if (shouldRotateAlert) {
        const alertCount = pollingCoordinator.getAlerts(state.selectedClassId)?.data?.alerts.length || 0;
        sessionManager.advanceAlert(sessionId, alertCount);
        sessionManager.markAlertRotated(sessionId, now);
      }
    }

    if (state.activeScreen === 'students') {
      const shouldRotateStudents = state.lastStudentRotationAt === null || now - state.lastStudentRotationAt >= 12_000;
      if (shouldRotateStudents) {
        const studentCount = pollingCoordinator.getStudents(state.selectedClassId)?.data?.students.length || 0;
        sessionManager.advanceStudentPage(sessionId, studentCount, displayService.studentsPerPage());
        sessionManager.markStudentRotated(sessionId, now);
      }
    }
  }

  private renderSession(sessionId: string, source: string): void {
    const session = this.sessions.get(sessionId);
    const state = sessionManager.get(sessionId);
    if (!session || !state) return;

    sessionManager.ensureClassSelection(sessionId, pollingCoordinator.getClasses().data, config.defaultClassId);

    const selectedClassId = state.selectedClassId;
    const context = {
      now: Date.now(),
      session: state,
      classes: pollingCoordinator.getClasses(),
      alerts: selectedClassId ? pollingCoordinator.getAlerts(selectedClassId) : null,
      summary: selectedClassId ? pollingCoordinator.getSummary(selectedClassId) : null,
      students: selectedClassId ? pollingCoordinator.getStudents(selectedClassId) : null,
    };

    const text = displayService.render(context);
    if (!sessionManager.shouldRender(sessionId, text) && source === 'tick') {
      return;
    }

    try {
      logger.info('Rendering text wall', {
        sessionId,
        source,
        view: selectedViewType(),
        selectedClassId,
        screen: state.activeScreen,
        textLength: text.length,
        textPreview: text.split('\n').slice(0, 3).join(' | '),
      });
      session.layouts.showTextWall(text, {
        view: selectedViewType(),
        durationMs: undefined,
      });
      sessionManager.recordRender(sessionId, text, context.now);
    } catch (error) {
      const message = String(error);
      logger.warn('Render failed', { sessionId, source, error: message });
      if (message.includes('WebSocket not connected') || message.includes('current state: CLOSED')) {
        this.sessions.delete(sessionId);
        sessionManager.disconnect(sessionId);
      }
    }
  }
}

logger.info('Starting ClassWatch Mentra app', {
  port: config.port,
  packageName: config.packageName,
  classwatchBaseUrl: config.classwatchBaseUrl,
  healthEndpoint: buildEndpoint('/api/health'),
});

const app = new ClassWatchMentraApp();
app.start().catch((error) => {
  logger.error('Failed to start app', { error: String(error) });
  process.exit(1);
});
