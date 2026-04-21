import { createClient } from '@/lib/supabase/server'
import { moderateAdAction } from './actions'
import type { Ad } from '@prince-edward/shared'

export default async function AdsPage() {
  const supabase = createClient()
  const { data: ads } = await supabase
    .from('ads')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Parent Business Ads</h1>
      <div className="bg-white rounded-xl shadow divide-y">
        {ads?.length === 0 && (
          <p className="p-6 text-gray-400 text-sm">No ads submitted yet.</p>
        )}
        {(ads as Ad[])?.map((ad) => (
          <div key={ad.id} className="p-4 flex items-center gap-4">
            {ad.logo_url && (
              <img src={ad.logo_url} alt="" className="w-12 h-12 object-contain rounded-lg border" />
            )}
            <div className="flex-1">
              <p className="font-medium">{ad.business_name}</p>
              <p className="text-sm text-gray-500">{ad.description}</p>
              <p className="text-xs text-gray-400 mt-0.5">Reach: {ad.reach} · Expires: {new Date(ad.expires_at).toLocaleDateString()}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              ad.status === 'approved' ? 'bg-green-100 text-green-700' :
              ad.status === 'rejected' ? 'bg-red-100 text-red-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {ad.status}
            </span>
            {ad.status === 'pending' && (
              <form action={moderateAdAction} className="flex gap-2">
                <input type="hidden" name="id" value={ad.id} />
                <button name="status" value="approved" className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700">Approve</button>
                <button name="status" value="rejected" className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700">Reject</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
