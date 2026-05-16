import type { Metadata } from 'next'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AppShell } from '@/components/shared/AppShell'

export const metadata: Metadata = {
  title: {
    default: 'Dashboard Admin',
    template: '%s | Admin — Ooredoo Crédit',
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell 
      sidebar={<AdminSidebar />} 
      userRole="admin"
    >
      {children}
    </AppShell>
  )
}
