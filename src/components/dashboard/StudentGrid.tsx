'use client'

import Grid from '@mui/material/Grid'
import type { Student } from '@/lib/types'
import StudentCard from './StudentCard'

interface StudentGridProps {
  readonly students: readonly Student[]
  readonly onStudentClick: (studentId: string) => void
}

export default function StudentGrid({ students, onStudentClick }: StudentGridProps) {
  return (
    <Grid container spacing={2}>
      {students.map((student) => (
        <Grid key={student.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StudentCard student={student} onClick={onStudentClick} />
        </Grid>
      ))}
    </Grid>
  )
}
