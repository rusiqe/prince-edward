import { createClient } from '@/lib/supabase/server'
import type { Announcement } from '@prince-edward/shared'

export default async function AnnouncementsPage() {
  const supabase = createClient()
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <a
          href="/dashboard/announcements/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          New announcement
        </a>
      </div>
      <div className="bg-white rounded-xl shadow divide-y">
        {announcements?.length === 0 && (
          <p className="p-6 text-gray-400 text-sm">No announcements yet.</p>
        )}
        {(announcements as Announcement[])?.map((a) => (
          <div key={a.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {a.urgent && (
                <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  Urgent
                </span>
              )}
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-gray-500">
                  {a.target_role} · {new Date(a.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <a
              href={`/dashboard/announcements/${a.id}`}
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
