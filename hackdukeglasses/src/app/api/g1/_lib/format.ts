import type { AnalyticsSnapshot, StudentStatus } from '@/lib/types'

const LINE_WIDTH = 40

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 1) + '…'
}

function padRight(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width)
  return text + ' '.repeat(width - text.length)
}

export function formatAlertLine(name: string, reason: string, progress: number): string {
  const prefix = '! '
  const suffix = `  ${String(progress).padStart(3)}%`
  const maxReason = LINE_WIDTH - prefix.length - suffix.length - name.length - 2
  const shortReason = maxReason > 5 ? ': ' + truncate(reason, maxReason) : ''
  return truncate(`${prefix}${name}${shortReason}${suffix}`, LINE_WIDTH)
}

export function formatStudentLine(name: string, status: StudentStatus, progress: number): string {
  const prefix = status === 'flagged' ? '!! ' : '   '
  const suffix = `${String(progress).padStart(3)}%`
  const nameWidth = LINE_WIDTH - prefix.length - suffix.length - 1
  return `${prefix}${padRight(truncate(name, nameWidth), nameWidth)} ${suffix}`
}

export function formatClassLine(name: string, subject: string, count: number): string {
  return truncate(`${name} - ${subject} (${count})`, LINE_WIDTH)
}

export function formatSummaryText(analytics: AnalyticsSnapshot, className: string): string {
  const lines = [
    truncate(`${className} - Summary`, LINE_WIDTH),
    truncate(`Struggling: ${analytics.strugglingPercent}% (${analytics.totalFlagged}/${analytics.totalStudents})`, LINE_WIDTH),
    truncate(`Complete:   ${analytics.completionPercent}%`, LINE_WIDTH),
    `Top issue: ${truncate(analytics.mostCommonProblem, LINE_WIDTH - 11)}`,
  ]
  return lines.join('\n')
}
