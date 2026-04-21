import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'

const mockEq = vi.fn().mockResolvedValue({ error: null })
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate })

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({ from: mockFrom }),
}))

import { moderateAdAction } from '../actions'

describe('moderateAdAction', () => {
  beforeEach(() => vi.clearAllMocks())

  const makeForm = (id: string, status: string) => {
    const fd = new FormData()
    fd.set('id', id)
    fd.set('status', status)
    return fd
  }

  it('approves an ad', async () => {
    await moderateAdAction(makeForm('ad-123', 'approved'))

    expect(mockFrom).toHaveBeenCalledWith('ads')
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'approved' })
    expect(mockEq).toHaveBeenCalledWith('id', 'ad-123')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/ads')
  })

  it('rejects an ad', async () => {
    await moderateAdAction(makeForm('ad-456', 'rejected'))
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'rejected' })
  })

  it('does nothing for an invalid status value', async () => {
    await moderateAdAction(makeForm('ad-789', 'pending'))
    expect(mockFrom).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('does nothing if status is an arbitrary string', async () => {
    await moderateAdAction(makeForm('ad-789', 'DELETE FROM ads;'))
    expect(mockFrom).not.toHaveBeenCalled()
  })
})
