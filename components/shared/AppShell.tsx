'use client'

import React, { useState } from 'react'
import { MobileNavbar } from '@/components/shared/MobileNavbar'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ArrowLeftRight, 
  CreditCard 
} from 'lucide-react'
import { useEffect } from 'react'
import { useNotificationStore } from '@/lib/stores/notificationStore'
import { notificationService } from '@/lib/services/notificationService'

interface AppShellProps {
  children: React.ReactNode
  sidebar: React.ReactElement
  userRole: 'admin' | 'revendeur'
}

export function AppShell({ children, sidebar, userRole }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const adminNavItems = [
    { title: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Clients', href: '/revendeurs', icon: Users, badge: '47' },
    { title: 'Produits', href: '/produits', icon: Package },
    { title: 'Txns', href: '/transactions', icon: ArrowLeftRight },
  ]

  const revendeurNavItems = [
    { title: 'Home', href: '/revendeur/dashboard', icon: LayoutDashboard },
    { title: 'Catalogue', href: '/revendeur/produits', icon: Package },
    { title: 'Txns', href: '/revendeur/transactions', icon: ArrowLeftRight },
    { title: 'Payer', href: '/revendeur/paiements', icon: CreditCard },
  ]

  const navItems = userRole === 'admin' ? adminNavItems : revendeurNavItems

  const { unreadCount, fetchNotifications, addNotification } = useNotificationStore()

  useEffect(() => {
    // 1. Charger les notifs existantes
    fetchNotifications()

    // 2. S'abonner au temps réel
    const unsubscribe = notificationService.subscribeToNotifications((newNotif) => {
      addNotification(newNotif)
    })

    return () => unsubscribe()
  }, [fetchNotifications, addNotification])

  // Clone sidebar and pass props
  const SidebarWithProps = React.cloneElement(sidebar as React.ReactElement<any>, {
    mobileOpen,
    onMobileOpenChange: setMobileOpen
  })

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {SidebarWithProps}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileNavbar 
          items={navItems} 
          onMenuClick={() => setMobileOpen(true)}
          userRole={userRole}
        />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="p-4 lg:p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
