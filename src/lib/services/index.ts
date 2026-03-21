import type { ClassService } from './class-service'
import { SupabaseClassService } from './supabase-class-service'

export type { ClassService }

export const classService: ClassService = new SupabaseClassService()
