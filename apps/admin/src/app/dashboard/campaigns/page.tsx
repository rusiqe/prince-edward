import { createClient } from '@/lib/supabase/server'
import type { Campaign } from '@prince-edward/shared'

export default async function CampaignsPage() {
  const supabase = createClient()
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fundraising Campaigns</h1>
        <a
          href="/dashboard/campaigns/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          New campaign
        </a>
      </div>
      <div className="bg-white rounded-xl shadow divide-y">
        {campaigns?.length === 0 && (
          <p className="p-6 text-gray-400 text-sm">No campaigns yet.</p>
        )}
        {(campaigns as Campaign[])?.map((c) => (
          <div key={c.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{c.title}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                c.status === 'active' ? 'bg-green-100 text-green-700' :
                c.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {c.status}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(100, (c.raised_amount / c.goal_amount) * 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              ${c.raised_amount.toLocaleString()} raised of ${c.goal_amount.toLocaleString()} goal
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
