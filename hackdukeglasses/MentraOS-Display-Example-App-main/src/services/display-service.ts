import type { G1ClassEntry } from '../types/g1';
import type { RenderContext } from '../types/session';

const LINE_WIDTH = 40;
const STUDENTS_PER_PAGE = 5;

function truncate(text: string, max = LINE_WIDTH): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function divider(char = '-'): string {
  return char.repeat(LINE_WIDTH);
}

function ageLabel(lastSuccessAt: number | null, now: number): string {
  if (!lastSuccessAt) return 'waiting';
  const ageSeconds = Math.max(0, Math.floor((now - lastSuccessAt) / 1000));
  return `${ageSeconds}s old`;
}

function header(title: string, subtitle?: string): string[] {
  const lines = [truncate(title), divider()];
  if (subtitle) {
    lines.push(truncate(subtitle));
    lines.push(divider());
  }
  return lines;
}

function classesPage(classes: readonly G1ClassEntry[], selectedClassId: string | null): string {
  const lines = header('ClassWatch Live', 'Choose a class');

  if (classes.length === 0) {
    lines.push('No classes returned yet.');
    lines.push('Check ClassWatch server.');
    return lines.join('\n');
  }

  classes.slice(0, 5).forEach((entry) => {
    const marker = entry.id === selectedClassId ? '>' : ' ';
    lines.push(truncate(`${marker} ${entry.g1_text}`));
  });

  if (classes.length > 5) {
    lines.push(truncate(`+ ${classes.length - 5} more classes`));
  }

  return lines.join('\n');
}

function summaryPage(context: RenderContext): string {
  const className = context.summary?.data?.class_name || context.session.selectedClassId || 'Class';
  const lines = header('ClassWatch Summary', className);

  if (context.summary?.error) {
    lines.push('Summary unavailable.');
    lines.push(truncate(context.summary.error));
    return lines.join('\n');
  }

  if (!context.summary?.data) {
    lines.push('Loading summary...');
    lines.push(`Freshness: ${ageLabel(context.summary?.lastSuccessAt || null, context.now)}`);
    return lines.join('\n');
  }

  lines.push(...context.summary.data.g1_text.split('\n').map((line) => truncate(line)));
  lines.push(divider());
  lines.push(`Freshness: ${ageLabel(context.summary.lastSuccessAt, context.now)}`);
  return lines.join('\n');
}

function alertsPage(context: RenderContext): string {
  const className = context.alerts?.data?.class_name || context.session.selectedClassId || 'Class';
  const lines = header('ClassWatch Alerts', className);

  if (context.alerts?.error) {
    lines.push('Alerts unavailable.');
    lines.push(truncate(context.alerts.error));
    return lines.join('\n');
  }

  const alerts = context.alerts?.data?.alerts || [];
  if (alerts.length === 0) {
    lines.push('No active alerts right now.');
    lines.push('Nice. Tiny classroom victory.');
    if (context.summary?.data) {
      lines.push(divider());
      lines.push(`Flagged: ${context.summary.data.total_flagged}/${context.summary.data.total_students}`);
    }
    return lines.join('\n');
  }

  const safeIndex = context.session.alertIndex % alerts.length;
  const alert = alerts[safeIndex];
  lines.push(`Alert ${safeIndex + 1}/${alerts.length}`);
  lines.push(divider());
  lines.push(truncate(alert.g1_text));
  lines.push(`Cat: ${alert.flag_category}`);
  lines.push(`Conf: ${Math.round(alert.confidence * 100)}%`);

  if (alert.confusion_highlights.length > 0) {
    lines.push(divider());
    lines.push(truncate(`Hint: ${alert.confusion_highlights[0]}`));
  }

  lines.push(divider());
  lines.push(`Freshness: ${ageLabel(context.alerts?.lastSuccessAt || null, context.now)}`);
  return lines.join('\n');
}

function studentsPage(context: RenderContext): string {
  const className = context.students?.data?.class_name || context.session.selectedClassId || 'Class';
  const lines = header('ClassWatch Roster', className);

  if (context.students?.error) {
    lines.push('Roster unavailable.');
    lines.push(truncate(context.students.error));
    return lines.join('\n');
  }

  const students = context.students?.data?.students || [];
  if (students.length === 0) {
    lines.push('No student data yet.');
    return lines.join('\n');
  }

  const pageCount = Math.max(1, Math.ceil(students.length / STUDENTS_PER_PAGE));
  const safePage = context.session.studentPage % pageCount;
  const start = safePage * STUDENTS_PER_PAGE;
  const pageStudents = students.slice(start, start + STUDENTS_PER_PAGE);

  lines.push(`Page ${safePage + 1}/${pageCount}`);
  lines.push(divider());
  pageStudents.forEach((student) => {
    lines.push(truncate(student.g1_text));
  });
  lines.push(divider());
  lines.push(`Freshness: ${ageLabel(context.students?.lastSuccessAt || null, context.now)}`);
  return lines.join('\n');
}

export class DisplayService {
  readyMessage(): string {
    return [
      'ClassWatch Live',
      divider(),
      'Connecting to ClassWatch...',
      'Waiting for first poll.',
    ].join('\n');
  }

  render(context: RenderContext): string {
    if (!context.session.selectedClassId) {
      return classesPage(context.classes.data?.classes || [], context.session.selectedClassId);
    }

    if (context.session.activeScreen === 'alerts') {
      return alertsPage(context);
    }

    if (context.session.activeScreen === 'students') {
      return studentsPage(context);
    }

    return summaryPage(context);
  }

  studentsPerPage(): number {
    return STUDENTS_PER_PAGE;
  }
}
