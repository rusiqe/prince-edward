export type UserRole =
  | 'super_admin'
  | 'school_admin'
  | 'teacher'
  | 'parent'
  | 'student'
  | 'alumni'

export type User = {
  id: string
  email: string
  role: UserRole
  school_id: string | null
  date_of_birth: string | null
  push_token: string | null
  created_at: string
}

export type Student = {
  id: string
  name: string
  date_of_birth: string
  grade: string
  class: string
  school_id: string
  created_at: string
}

export type ParentStudent = {
  parent_id: string
  student_id: string
}

export type InviteCode = {
  id: string
  code: string
  school_id: string
  student_ids: string[]
  used: boolean
  expires_at: string
  created_at: string
}

export type Alumni = {
  id: string
  user_id: string
  school_id: string
  graduation_year: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export const isViewOnly = (dob: string): boolean => {
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age < 13
}
