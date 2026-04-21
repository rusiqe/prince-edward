import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { registerForPushNotifications } from '@/lib/notifications'

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const inAuthGroup = segments[0] === '(auth)'
      if (!session && !inAuthGroup) {
        router.replace('/(auth)/login')
      } else if (session && inAuthGroup) {
        router.replace('/(tabs)/calendar')
        registerForPushNotifications()
      }
    })
    return () => subscription.unsubscribe()
  }, [segments])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  )
}
