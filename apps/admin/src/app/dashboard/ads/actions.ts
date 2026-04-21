'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function moderateAdAction(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as 'approved' | 'rejected'
  const supabase = createClient()
  await supabase.from('ads').update({ status }).eq('id', id)
  revalidatePath('/dashboard/ads')
}
