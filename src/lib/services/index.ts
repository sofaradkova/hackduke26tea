import type { ClassService } from './class-service'
import { MockClassService } from './mock-class-service'

export type { ClassService }

export const classService: ClassService = new MockClassService()
