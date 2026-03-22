'use client'

import Grid from '@mui/material/Grid'
import type { ClassData } from '@/lib/types'
import ClassCard from './ClassCard'

interface ClassListGridProps {
  readonly classes: readonly ClassData[]
}

export default function ClassListGrid({ classes }: ClassListGridProps) {
  return (
    <Grid container spacing={3}>
      {classes.map((cls) => (
        <Grid key={cls.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <ClassCard classData={cls} />
        </Grid>
      ))}
    </Grid>
  )
}
