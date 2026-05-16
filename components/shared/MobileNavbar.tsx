'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ArrowLeftRight, 
  Menu,
  Bell,
  Search,
  Wifi
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string
}

interface MobileNavbarProps {
  items: NavItem[]
  onMenuClick?: () => void
  userRole?: 'admin' | 'revendeur'
}

export function MobileNavbar({ items, onMenuClick, userRole }: MobileNavbarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Top Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
            <Wifi size={16} className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tight text-foreground">Ooredoo</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white dark:border-slate-950"></span>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={onMenuClick}>
            <Menu size={22} />
          </Button>
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 border-t border-border z-40 flex items-center justify-around px-2 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        {items.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-full transition-all relative cursor-pointer active:scale-90",
                isActive ? "text-red-600" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-colors",
                isActive ? "bg-red-50 dark:bg-red-950/30" : ""
              )}>
                <Icon size={20} className={isActive ? "stroke-[2.5px]" : "stroke-[2px]"} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.title}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-red-600 rounded-b-full"></span>
              )}
              {item.badge && (
                <span className="absolute top-1 right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      
      {/* Spacer for content */}
      <div className="lg:hidden h-16 w-full"></div>
    </>
  )
}
