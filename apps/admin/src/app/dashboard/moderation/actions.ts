'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_TABLES = ['event_photos', 'comments'] as const
type ModerationTable = (typeof ALLOWED_TABLES)[number]
const ALLOWED_STATUSES = ['approved', 'rejected'] as const

export async function moderateAction(formData: FormData) {
  const table = formData.get('table') as string
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  if (!(ALLOWED_TABLES as readonly string[]).includes(table)) return
  if (!(ALLOWED_STATUSES as readonly string[]).includes(status)) return

  const supabase = createClient()
  await supabase.from(table as ModerationTable).update({ status }).eq('id', id)
  revalidatePath('/dashboard/moderation')
}
