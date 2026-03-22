'use client'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import StudentGrid from '@/components/dashboard/StudentGrid'
import StudentDetailModal from '@/components/student-modal/StudentDetailModal'
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader'
import { useStudentPolling } from '@/hooks/use-student-polling'
import { useClassData } from '@/context/class-context'
import { useSession } from '@/context/session-context'

interface DashboardClientProps {
  readonly classId: string
  readonly className: string
}

export default function DashboardClient({ classId, className }: DashboardClientProps) {
  const { students, analytics, isLoading } = useClassData()
  const { selectedStudentId, setSelectedStudentId } = useSession()

  useStudentPolling(classId)

  const selectedStudent = students.find((s) => s.id === selectedStudentId) ?? null

  if (isLoading) {
    return (
      <AppShell
        topBar={<TopBar title={className} showPanelToggle />}
        showPanel
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      </AppShell>
    )
  }

  return (
    <AppShell
      topBar={<AnalyticsHeader title={className} analytics={analytics} showPanelToggle />}
      showPanel
    >
      <StudentGrid students={students} onStudentClick={setSelectedStudentId} />

      <StudentDetailModal
        student={selectedStudent}
        open={selectedStudentId !== null}
        onClose={() => setSelectedStudentId(null)}
      />
    </AppShell>
  )
}
