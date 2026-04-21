import { createClient } from '@/lib/supabase/server'
import { moderateAction } from './actions'

export default async function ModerationPage() {
  const supabase = createClient()

  const [{ data: photos }, { data: comments }] = await Promise.all([
    supabase
      .from('event_photos')
      .select('*, events(title)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    supabase
      .from('comments')
      .select('*, events(title)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
  ])

  const totalPending = (photos?.length ?? 0) + (comments?.length ?? 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Moderation Queue</h1>
        {totalPending > 0 && (
          <span className="bg-amber-100 text-amber-700 text-sm font-medium px-3 py-1 rounded-full">
            {totalPending} pending
          </span>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-700">Photos</h2>
        {photos?.length === 0 && <p className="text-sm text-gray-400">Nothing pending.</p>}
        {photos?.map((photo) => (
          <div key={photo.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <img src={photo.url} alt="" className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Event: {(photo.events as any)?.title}</p>
            </div>
            <form action={moderateAction} className="flex gap-2">
              <input type="hidden" name="table" value="event_photos" />
              <input type="hidden" name="id" value={photo.id} />
              <button name="status" value="approved" className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700">Approve</button>
              <button name="status" value="rejected" className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700">Reject</button>
            </form>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-700">Comments</h2>
        {comments?.length === 0 && <p className="text-sm text-gray-400">Nothing pending.</p>}
        {comments?.map((comment) => (
          <div key={comment.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-medium text-sm">{comment.body}</p>
              <p className="text-sm text-gray-500">Event: {(comment.events as any)?.title}</p>
            </div>
            <form action={moderateAction} className="flex gap-2">
              <input type="hidden" name="table" value="comments" />
              <input type="hidden" name="id" value={comment.id} />
              <button name="status" value="approved" className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700">Approve</button>
              <button name="status" value="rejected" className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700">Reject</button>
            </form>
          </div>
        ))}
      </section>
    </div>
  )
}
