import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const mockGetUser = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

// Import after mocks
const { middleware } = await import('../middleware')

const makeRequest = (path: string) =>
  new NextRequest(new URL(`http://localhost${path}`), {
    headers: { cookie: '' },
  })

describe('middleware', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects unauthenticated users to /login', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await middleware(makeRequest('/dashboard/events'))

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/login')
  })

  it('allows unauthenticated users to access /login', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await middleware(makeRequest('/login'))

    expect(res.status).not.toBe(307)
  })

  it('allows authenticated users through to protected routes', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    const res = await middleware(makeRequest('/dashboard/events'))

    expect(res.status).not.toBe(307)
  })

  it('does not redirect authenticated users away from /login', async () => {
    // Admins may land on /login by direct URL — they should just pass through
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } })
    const res = await middleware(makeRequest('/login'))

    expect(res.status).not.toBe(307)
  })
})
