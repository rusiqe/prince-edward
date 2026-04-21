import { createClient } from '@/lib/supabase/server'
import type { SchoolEvent } from '@prince-edward/shared'

export default async function EventsPage() {
  const supabase = createClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('start_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <a
          href="/dashboard/events/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          New event
        </a>
      </div>
      <div className="bg-white rounded-xl shadow divide-y">
        {events?.length === 0 && (
          <p className="p-6 text-gray-400 text-sm">No events yet.</p>
        )}
        {(events as SchoolEvent[])?.map((event) => (
          <div key={event.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{event.title}</p>
              <p className="text-sm text-gray-500">
                {new Date(event.start_at).toLocaleDateString()} · {event.category}
              </p>
            </div>
            <a
              href={`/dashboard/events/${event.id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              Edit
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
