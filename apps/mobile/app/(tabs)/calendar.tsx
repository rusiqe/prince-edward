import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { Calendar } from 'react-native-calendars'
import { supabase } from '@/lib/supabase'
import type { SchoolEvent } from '@prince-edward/shared'

export default function CalendarScreen() {
  const [events, setEvents] = useState<SchoolEvent[]>([])
  const [selected, setSelected] = useState(new Date().toISOString().split('T')[0]!)
  const [markedDates, setMarkedDates] = useState<Record<string, { marked: boolean; dotColor: string }>>({})

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .order('start_at', { ascending: true })
      .then(({ data }) => {
        if (!data) return
        setEvents(data as SchoolEvent[])
        const marks: typeof markedDates = {}
        for (const e of data) {
          const day = e.start_at.split('T')[0]!
          marks[day] = { marked: true, dotColor: '#003087' }
        }
        setMarkedDates(marks)
      })
  }, [])

  const dayEvents = events.filter((e) => e.start_at.startsWith(selected))

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelected(day.dateString)}
        markedDates={{ ...markedDates, [selected]: { ...(markedDates[selected] ?? {}), selected: true, selectedColor: '#003087' } }}
      />
      <FlatList
        data={dayEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No events on this day.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.dot, { backgroundColor: categoryColour(item.category) }]} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.description && <Text style={styles.cardDesc}>{item.description}</Text>}
              <Text style={styles.cardMeta}>{item.category}</Text>
            </View>
          </View>
        )}
      />
    </View>
  )
}

const categoryColour = (cat: string) => ({
  academic: '#3B82F6',
  sport: '#10B981',
  social: '#F59E0B',
  exam: '#EF4444',
  holiday: '#8B5CF6',
  meeting: '#6B7280',
  other: '#9CA3AF',
}[cat] ?? '#9CA3AF')

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16, gap: 10 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111' },
  cardDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  cardMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 4, textTransform: 'capitalize' },
})
