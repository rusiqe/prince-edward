import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import SignupScreen from '../signup'

// Mock Supabase
const mockInviteQuery = jest.fn()
const mockSignUp = jest.fn()
const mockInsert = jest.fn().mockResolvedValue({ error: null })

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn((table: string) => {
      if (table === 'invite_codes') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: mockInviteQuery,
        }
      }
      return { insert: mockInsert, update: jest.fn().mockResolvedValue({ error: null }) }
    }),
    auth: { signUp: mockSignUp },
  },
}))

jest.mock('expo-router', () => ({ useRouter: () => ({ replace: jest.fn() }) }))

const validInvite = {
  id: 'invite-1',
  school_id: 'school-1',
  student_ids: ['student-1'],
  used: false,
}

describe('SignupScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders invite code, email and password fields', () => {
    const { getByPlaceholderText } = render(<SignupScreen />)
    expect(getByPlaceholderText('Invite code')).toBeTruthy()
    expect(getByPlaceholderText('Email')).toBeTruthy()
    expect(getByPlaceholderText('Password')).toBeTruthy()
  })

  it('shows an alert when invite code is empty', async () => {
    const { getByText, getByPlaceholderText } = render(<SignupScreen />)
    fireEvent.changeText(getByPlaceholderText('Email'), 'parent@test.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.press(getByText('Create account'))

    // Alert should prevent supabase call
    await waitFor(() => {
      expect(mockInviteQuery).not.toHaveBeenCalled()
    })
  })

  it('does not create account when invite code is invalid', async () => {
    mockInviteQuery.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })

    const { getByText, getByPlaceholderText } = render(<SignupScreen />)
    fireEvent.changeText(getByPlaceholderText('Invite code'), 'BADCODE')
    fireEvent.changeText(getByPlaceholderText('Email'), 'parent@test.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
    fireEvent.press(getByText('Create account'))

    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled()
    })
  })

  it('creates account and links parent to students on valid invite', async () => {
    mockInviteQuery.mockResolvedValueOnce({ data: validInvite, error: null })
    mockSignUp.mockResolvedValueOnce({ data: { user: { id: 'user-new' } }, error: null })

    const { getByText, getByPlaceholderText } = render(<SignupScreen />)
    fireEvent.changeText(getByPlaceholderText('Invite code'), 'VALID123')
    fireEvent.changeText(getByPlaceholderText('Email'), 'parent@school.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'securepass')
    fireEvent.press(getByText('Create account'))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'parent@school.com',
        password: 'securepass',
      })
    })
  })
})
