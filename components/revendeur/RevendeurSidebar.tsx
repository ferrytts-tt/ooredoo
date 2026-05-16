'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  CreditCard,
  LogOut,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Menu,
  X,
  Bell
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/authStore'

const navItems = [
  {
    title: 'Mon Espace',
    href: '/revendeur/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Catalogue Produits',
    href: '/revendeur/produits',
    icon: Package,
  },
  {
    title: 'Mes Transactions',
    href: '/revendeur/transactions',
    icon: ArrowLeftRight,
  },
  {
    title: 'Historique Paiements',
    href: '/revendeur/paiements',
    icon: CreditCard,
  },
]

interface RevendeurSidebarProps {
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

export function RevendeurSidebar({ mobileOpen: externalMobileOpen, onMobileOpenChange }: RevendeurSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [internalMobileOpen, setInternalMobileOpen] = useState(false)

  const mobileOpen = externalMobileOpen ?? internalMobileOpen
  const setMobileOpen = onMobileOpenChange ?? setInternalMobileOpen
  
  const { reseller, user: profile } = useAuthStore()
  const currentUser = reseller || { company_name: 'Revendeur', manager_name: profile?.full_name || 'Chargement...' }

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
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Wifi className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-sm text-foreground">Ooredoo</span>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Espace Revendeur
            </p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
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
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group cursor-pointer',
                isActive
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-slate-100 dark:text-slate-900'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground active:scale-[0.98]',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className={cn(
                'w-4.5 h-4.5 flex-shrink-0',
                isActive ? 'text-current' : ''
              )} size={18} />
              {!collapsed && (
                <span className="font-medium text-sm flex-1">{item.title}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-border space-y-2">
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

        <div className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-accent/50',
          collapsed && 'justify-center px-2'
        )}>
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-slate-900 text-white text-xs font-bold dark:bg-slate-100 dark:text-slate-900">
              {currentUser.manager_name?.substring(0, 2).toUpperCase() || 'RV'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{currentUser.company_name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{currentUser.manager_name}</p>
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

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center h-8 w-8 rounded-full bg-background border border-border shadow-sm text-muted-foreground hover:text-foreground absolute -right-4 top-20 transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  )

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      {!onMobileOpenChange && (
        <button
          className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-background border border-border shadow-md"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      )}
      <aside className={cn(
        'fixed left-0 top-0 h-full z-[100] lg:hidden',
        'w-72 bg-white dark:bg-slate-950 border-r border-border shadow-2xl transition-transform duration-300 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>
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
