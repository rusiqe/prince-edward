import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSignIn = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { signInWithPassword: mockSignIn },
  }),
}))

import { loginAction } from '../actions'

const makeForm = (email: string, password: string) => {
  const fd = new FormData()
  fd.set('email', email)
  fd.set('password', password)
  return fd
}

const getRedirectUrl = (error: unknown): string => {
  if (error instanceof Error && error.message.startsWith('REDIRECT:')) {
    return error.message.slice('REDIRECT:'.length)
  }
  throw error
}

describe('loginAction', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to /dashboard/events on successful login', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null })

    const url = await loginAction(makeForm('admin@school.com', 'password123')).catch(getRedirectUrl)
    expect(url).toBe('/dashboard/events')
    expect(mockSignIn).toHaveBeenCalledWith({ email: 'admin@school.com', password: 'password123' })
  })

  it('redirects to /login?error=invalid_credentials on auth failure', async () => {
    mockSignIn.mockResolvedValueOnce({ error: { message: 'Invalid login credentials' } })

    const url = await loginAction(makeForm('bad@email.com', 'wrongpass')).catch(getRedirectUrl)
    expect(url).toBe('/login?error=invalid_credentials')
  })

  it('passes exact email and password from FormData', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null })

    await loginAction(makeForm('teacher@school.org', 's3cr3t!')).catch(() => {})
    expect(mockSignIn).toHaveBeenCalledWith({ email: 'teacher@school.org', password: 's3cr3t!' })
  })
})
