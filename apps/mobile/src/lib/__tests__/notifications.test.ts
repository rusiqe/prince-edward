import { registerForPushNotifications } from '../notifications'

// Mock expo-device
jest.mock('expo-device', () => ({ isDevice: true }))

// Mock expo-notifications
const mockGetPermissions = jest.fn()
const mockRequestPermissions = jest.fn()
const mockSetChannel = jest.fn()
const mockGetToken = jest.fn()

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: mockGetPermissions,
  requestPermissionsAsync: mockRequestPermissions,
  setNotificationChannelAsync: mockSetChannel,
  getExpoPushTokenAsync: mockGetToken,
  setNotificationHandler: jest.fn(),
  AndroidImportance: { MAX: 5 },
}))

// Mock Supabase
const mockUpdate = jest.fn().mockResolvedValue({ error: null })
const mockEq = jest.fn().mockResolvedValue({ error: null })
mockUpdate.mockReturnValue({ eq: mockEq })

jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({ update: mockUpdate }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
  },
}))

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}))

describe('registerForPushNotifications', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns null when not running on a physical device', async () => {
    jest.resetModules()
    jest.mock('expo-device', () => ({ isDevice: false }))
    const { registerForPushNotifications: reg } = await import('../notifications')
    const token = await reg()
    expect(token).toBeNull()
  })

  it('returns null when permissions are denied', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'denied' })
    mockRequestPermissions.mockResolvedValueOnce({ status: 'denied' })

    const token = await registerForPushNotifications()
    expect(token).toBeNull()
  })

  it('returns the push token when permissions are granted', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' })
    mockGetToken.mockResolvedValueOnce({ data: 'ExponentPushToken[abc123]' })

    const token = await registerForPushNotifications()
    expect(token).toBe('ExponentPushToken[abc123]')
  })

  it('skips permission request if already granted', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' })
    mockGetToken.mockResolvedValueOnce({ data: 'ExponentPushToken[xyz]' })

    await registerForPushNotifications()
    expect(mockRequestPermissions).not.toHaveBeenCalled()
  })

  it('persists the push token on the user record', async () => {
    const { supabase } = await import('../supabase')
    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' })
    mockGetToken.mockResolvedValueOnce({ data: 'ExponentPushToken[abc123]' })

    await registerForPushNotifications()

    expect(supabase.from).toHaveBeenCalledWith('users')
    expect(mockUpdate).toHaveBeenCalledWith({ push_token: 'ExponentPushToken[abc123]' })
    expect(mockEq).toHaveBeenCalledWith('id', 'user-1')
  })

  it('creates an Android notification channel', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' })
    mockGetToken.mockResolvedValueOnce({ data: 'ExponentPushToken[abc123]' })

    await registerForPushNotifications()
    expect(mockSetChannel).toHaveBeenCalledWith('default', expect.objectContaining({ name: 'default' }))
  })
})
