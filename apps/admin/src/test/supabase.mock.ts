import { vi } from 'vitest'

export const mockUpdate = vi.fn().mockResolvedValue({ error: null })
export const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate })

export const mockSupabase = {
  from: mockFrom,
  auth: {
    signInWithPassword: vi.fn(),
    getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
  },
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabase,
}))
