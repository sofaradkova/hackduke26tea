import { classService } from '@/lib/services'
import { notFound } from 'next/navigation'
import DashboardClient from './dashboard-client'

interface PageProps {
  params: Promise<{ classId: string }>
}

export default async function ClassDashboardPage({ params }: PageProps) {
  const { classId } = await params
  const classData = await classService.getClass(classId)

  if (!classData) {
    notFound()
  }

  return <DashboardClient classId={classData.id} className={classData.name} />
}
