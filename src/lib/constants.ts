export const POLL_INTERVAL_MS = 7000

export const TEACHER_NAME = 'Ms. Rivera'

export const APP_NAME = 'ClassWatch'

export const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: '#FFB5A7',
  Science: '#B7D1C0',
  English: '#C5B8E8',
  History: '#F9DFA0',
  'Computer Science': '#A7C7E7',
}

export function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] ?? '#E0DCD4'
}
