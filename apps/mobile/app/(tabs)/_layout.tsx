import { Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#003087',
        tabBarInactiveTintColor: '#999',
        headerStyle: { backgroundColor: '#003087' },
        headerTintColor: '#FFD700',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="announcements" options={{ title: 'Announcements' }} />
    </Tabs>
  )
}
