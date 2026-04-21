import { createClient } from '@/lib/supabase/server'

export default async function UsersPage() {
  const supabase = createClient()
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <a
          href="/dashboard/users/invite"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Generate invite code
        </a>
      </div>
      <div className="bg-white rounded-xl shadow divide-y">
        {users?.length === 0 && (
          <p className="p-6 text-gray-400 text-sm">No users yet.</p>
        )}
        {users?.map((user) => (
          <div key={user.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{user.email}</p>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
