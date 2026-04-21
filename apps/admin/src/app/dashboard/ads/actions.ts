'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_STATUSES = ['approved', 'rejected'] as const

export async function moderateAdAction(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  if (!(ALLOWED_STATUSES as readonly string[]).includes(status)) return

  const supabase = createClient()
  await supabase.from('ads').update({ status: status as 'approved' | 'rejected' }).eq('id', id)
  revalidatePath('/dashboard/ads')
}
