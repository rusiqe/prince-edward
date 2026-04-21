'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function moderateAction(formData: FormData) {
  const table = formData.get('table') as 'event_photos' | 'comments'
  const id = formData.get('id') as string
  const status = formData.get('status') as 'approved' | 'rejected'

  const supabase = createClient()
  await supabase.from(table).update({ status }).eq('id', id)
  revalidatePath('/dashboard/moderation')
}
