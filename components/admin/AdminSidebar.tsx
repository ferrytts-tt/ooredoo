'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Package,
  ArrowLeftRight,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Search,
  Menu,
  X,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useNotificationStore } from '@/lib/stores/notificationStore'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Revendeurs',
    href: '/revendeurs',
    icon: Users,
    badge: '47',
  },
  {
    title: 'Produits',
    href: '/produits',
    icon: Package,
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: ArrowLeftRight,
  },
  {
    title: 'Paiements',
    href: '/paiements',
    icon: CreditCard,
  },
  {
    title: 'Rapports',
    href: '/rapports',
    icon: BarChart3,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    badge: '4',
    badgeVariant: 'destructive' as const,
  },
  {
    title: 'Paramètres',
    href: '/parametres',
    icon: Settings,
  },
]

interface AdminSidebarProps {
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

export function AdminSidebar({ mobileOpen: externalMobileOpen, onMobileOpenChange }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const { unreadCount } = useNotificationStore()
  const [internalMobileOpen, setInternalMobileOpen] = useState(false)

  const mobileOpen = externalMobileOpen ?? internalMobileOpen
  const setMobileOpen = onMobileOpenChange ?? setInternalMobileOpen

  const handleLogout = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success('Déconnexion réussie')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-border',
        collapsed && 'justify-center px-2'
      )}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-600/30">
          <Wifi className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-sm text-foreground">Ooredoo</span>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Crédit Manager
            </p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const badgeValue = item.title === 'Notifications' ? (unreadCount > 0 ? unreadCount.toString() : undefined) : item.badge
          
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileOpen(false)
                }
              }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 group relative cursor-pointer',
                isActive
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground active:scale-[0.98]',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className={cn(
                'w-5 h-5 flex-shrink-0',
                isActive ? 'text-white' : ''
              )} size={20} />
              {!collapsed && (
                <>
                  <span className="font-medium text-sm flex-1">{item.title}</span>
                  {badgeValue && (
                    <Badge
                      variant={item.badgeVariant || 'secondary'}
                      className={cn(
                        'text-[10px] px-1.5 py-0 h-4 min-w-4',
                        isActive && item.badgeVariant !== 'destructive' && 'bg-white/20 text-white border-0'
                      )}
                    >
                      {badgeValue}
                    </Badge>
                  )}
                </>
              )}
              {collapsed && badgeValue && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {badgeValue}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-border space-y-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Thème' : undefined}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span className="text-sm font-medium">Mode {theme === 'dark' ? 'clair' : 'sombre'}</span>}
        </button>

        {/* User info */}
        <div className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-accent/50',
          collapsed && 'justify-center px-2'
        )}>
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-red-600 text-white text-xs font-bold">AD</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">Administrateur</p>
              <p className="text-[10px] text-muted-foreground truncate">admin@ooredoo.tn</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-red-600 transition-colors"
              title="Déconnexion"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center h-9 w-9 rounded-full bg-background border border-border shadow-md text-muted-foreground hover:text-foreground absolute -right-[18px] top-20 transition-all z-10"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button - only if not controlled externally */}
      {!onMobileOpenChange && (
        <button
          className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-background border border-border shadow-md"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      )}

      {/* Sidebar mobile */}
      <aside className={cn(
        'fixed left-0 top-0 h-full z-[100] lg:hidden',
        'w-72 bg-white dark:bg-slate-950 border-r border-border shadow-2xl transition-transform duration-300 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>

      {/* Sidebar desktop */}
      <aside className={cn(
        'hidden lg:flex flex-col relative h-full',
        'bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-[70px]' : 'w-64'
      )}>
        <SidebarContent />
      </aside>
    </>
  )
}
