import Link from 'next/link'

const nav = [
  { href: '/dashboard/events', label: 'Events' },
  { href: '/dashboard/announcements', label: 'Announcements' },
  { href: '/dashboard/users', label: 'Users' },
  { href: '/dashboard/moderation', label: 'Moderation' },
  { href: '/dashboard/campaigns', label: 'Campaigns' },
  { href: '/dashboard/ads', label: 'Ads' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-gray-900 text-white flex flex-col p-4 gap-1">
        <div className="text-lg font-bold mb-6 px-2">Prince Edward</div>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  )
}
