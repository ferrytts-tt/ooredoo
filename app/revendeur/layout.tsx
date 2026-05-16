import type { Metadata } from 'next'
import { RevendeurSidebar } from '@/components/revendeur/RevendeurSidebar'
import { AppShell } from '@/components/shared/AppShell'

export const metadata: Metadata = {
  title: {
    default: 'Mon Espace',
    template: '%s | Espace Revendeur — Ooredoo',
  },
}

export default function RevendeurLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell 
      sidebar={<RevendeurSidebar />} 
      userRole="revendeur"
    >
      {children}
    </AppShell>
  )
}
