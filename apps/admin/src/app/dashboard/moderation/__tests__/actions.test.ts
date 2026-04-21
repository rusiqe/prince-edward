import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'

// Supabase mock — must be before importing the action
const mockEq = vi.fn().mockResolvedValue({ error: null })
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate })

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({ from: mockFrom }),
}))

import { moderateAction } from '../actions'

describe('moderateAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const makeForm = (table: string, id: string, status: string) => {
    const fd = new FormData()
    fd.set('table', table)
    fd.set('id', id)
    fd.set('status', status)
    return fd
  }

  it('approves an event photo', async () => {
    await moderateAction(makeForm('event_photos', 'photo-123', 'approved'))

    expect(mockFrom).toHaveBeenCalledWith('event_photos')
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'approved' })
    expect(mockEq).toHaveBeenCalledWith('id', 'photo-123')
  })

  it('rejects a comment', async () => {
    await moderateAction(makeForm('comments', 'comment-456', 'rejected'))

    expect(mockFrom).toHaveBeenCalledWith('comments')
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'rejected' })
    expect(mockEq).toHaveBeenCalledWith('id', 'comment-456')
  })

  it('revalidates the moderation page after any action', async () => {
    await moderateAction(makeForm('event_photos', 'any-id', 'approved'))
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/moderation')
  })

  it('rejects unknown table names (security: no arbitrary table access)', async () => {
    await moderateAction(makeForm('users', 'admin-id', 'rejected'))
    // Should not call supabase at all for disallowed tables
    expect(mockFrom).not.toHaveBeenCalled()
  })
})
