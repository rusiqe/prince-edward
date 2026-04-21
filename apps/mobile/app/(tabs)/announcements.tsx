import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { supabase } from '@/lib/supabase'
import type { Announcement } from '@prince-edward/shared'

export default function AnnouncementsScreen() {
  const [items, setItems] = useState<Announcement[]>([])

  useEffect(() => {
    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => data && setItems(data as Announcement[]))

    // realtime: new announcements appear instantly
    const channel = supabase
      .channel('announcements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (payload) => {
        setItems((prev) => [payload.new as Announcement, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No announcements yet.</Text>}
      renderItem={({ item }) => (
        <View style={[styles.card, item.urgent && styles.urgent]}>
          {item.urgent && <Text style={styles.urgentBadge}>URGENT</Text>}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.meta}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  urgent: { borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  urgentBadge: { color: '#EF4444', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 6 },
  body: { fontSize: 14, color: '#374151', lineHeight: 20 },
  meta: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
})
