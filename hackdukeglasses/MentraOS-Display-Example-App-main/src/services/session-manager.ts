import type { G1ClassListResponse } from '../types/g1';
import type { ScreenName, SessionDebugView, SessionState } from '../types/session';

export class SessionManager {
  private readonly sessions = new Map<string, SessionState>();

  connect(sessionId: string, userId: string, defaultClassId: string | null): SessionState {
    const existing = this.sessions.get(sessionId);
    if (existing) {
      existing.selectedClassId = existing.selectedClassId || defaultClassId;
      return existing;
    }

    const created: SessionState = {
      sessionId,
      userId,
      selectedClassId: defaultClassId,
      activeScreen: defaultClassId ? 'summary' : 'classes',
      alertIndex: 0,
      studentPage: 0,
      lastRenderedText: null,
      lastRenderAt: null,
      lastAlertRotationAt: null,
      lastStudentRotationAt: null,
    };

    this.sessions.set(sessionId, created);
    return created;
  }

  disconnect(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  get(sessionId: string): SessionState | null {
    return this.sessions.get(sessionId) || null;
  }

  all(): readonly SessionState[] {
    return Array.from(this.sessions.values());
  }

  ensureClassSelection(sessionId: string, classesResponse: G1ClassListResponse | null, defaultClassId: string | null): SessionState | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (session.selectedClassId) return session;

    const classes = classesResponse?.classes || [];
    const preferred = defaultClassId && classes.find((entry) => entry.id === defaultClassId);
    const selected = preferred || (classes.length === 1 ? classes[0] : null);

    if (selected) {
      session.selectedClassId = selected.id;
      session.activeScreen = 'summary';
    }

    return session;
  }

  setSelectedClass(sessionId: string, classId: string | null): SessionState | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    session.selectedClassId = classId;
    session.alertIndex = 0;
    session.studentPage = 0;
    session.lastAlertRotationAt = null;
    session.lastStudentRotationAt = null;
    session.activeScreen = classId ? 'summary' : 'classes';
    return session;
  }

  setScreen(sessionId: string, screen: ScreenName): SessionState | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    session.activeScreen = screen;
    return session;
  }

  nextScreen(sessionId: string): SessionState | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const orderedScreens: ScreenName[] = session.selectedClassId
      ? ['alerts', 'summary', 'students']
      : ['classes'];

    const currentIndex = orderedScreens.indexOf(session.activeScreen);
    session.activeScreen = orderedScreens[(currentIndex + 1 + orderedScreens.length) % orderedScreens.length];
    return session;
  }

  advanceAlert(sessionId: string, alertCount: number): SessionState | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (alertCount <= 0) {
      session.alertIndex = 0;
      return session;
    }
    session.alertIndex = (session.alertIndex + 1) % alertCount;
    return session;
  }

  advanceStudentPage(sessionId: string, totalStudents: number, pageSize: number): SessionState | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (totalStudents <= 0) {
      session.studentPage = 0;
      return session;
    }
    const pageCount = Math.max(1, Math.ceil(totalStudents / pageSize));
    session.studentPage = (session.studentPage + 1) % pageCount;
    return session;
  }

  recordRender(sessionId: string, text: string, timestamp: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.lastRenderedText = text;
    session.lastRenderAt = timestamp;
  }

  shouldRender(sessionId: string, text: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    return session.lastRenderedText !== text;
  }

  markAlertRotated(sessionId: string, timestamp: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.lastAlertRotationAt = timestamp;
  }

  markStudentRotated(sessionId: string, timestamp: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.lastStudentRotationAt = timestamp;
  }

  debugView(): readonly SessionDebugView[] {
    return this.all().map((session) => ({
      sessionId: session.sessionId,
      userId: session.userId,
      selectedClassId: session.selectedClassId,
      activeScreen: session.activeScreen,
      alertIndex: session.alertIndex,
      studentPage: session.studentPage,
      lastRenderAt: session.lastRenderAt,
    }));
  }
}
