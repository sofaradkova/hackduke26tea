import type { ClassService } from './class-service'
import { DemoClassService } from './demo-class-service'

export type { ClassService }

export const classService: ClassService = new DemoClassService()
