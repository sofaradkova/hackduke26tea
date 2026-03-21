import { classService } from '@/lib/services'
import HomeClient from './home-client'

export default async function HomePage() {
  const classes = await classService.getClasses()
  return <HomeClient classes={[...classes]} />
}
