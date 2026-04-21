export type EventCategory =
  | 'academic'
  | 'sport'
  | 'social'
  | 'exam'
  | 'holiday'
  | 'meeting'
  | 'other'

export type RecurrenceRule = {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  until?: string
}

export type SchoolEvent = {
  id: string
  school_id: string
  title: string
  description: string | null
  start_at: string
  end_at: string
  category: EventCategory
  recurrence: RecurrenceRule | null
  target_grades: string[] | null  // null means all grades
  created_by: string
  created_at: string
}

export type EventPhoto = {
  id: string
  event_id: string
  student_id: string
  url: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export type Comment = {
  id: string
  event_id: string
  student_id: string
  body: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export type Announcement = {
  id: string
  school_id: string
  title: string
  body: string
  urgent: boolean
  target_role: 'all' | 'parents' | 'students' | 'teachers'
  created_by: string
  created_at: string
}
