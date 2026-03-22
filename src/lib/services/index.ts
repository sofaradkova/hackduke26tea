import type { ClassService } from './class-service'
import { MockClassService } from './mock-class-service'
import { DemoClassService } from './demo-class-service'

export type { ClassService }

export const classService: ClassService =
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    ? new DemoClassService()
    : new MockClassService()
