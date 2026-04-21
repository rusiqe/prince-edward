export type NotificationLog = {
  id: string
  user_id: string
  title: string
  body: string
  data: Record<string, unknown> | null
  sent_at: string
}
