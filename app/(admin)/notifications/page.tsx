'use client'

import { useState } from 'react'
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  CreditCard,
  UserPlus,
  PackageX,
  Trash2,
  Check
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockNotifications } from '@/lib/data/mockData'
import { formatDate } from '@/lib/utils'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  const clearRead = () => {
    setNotifications(notifications.filter(n => !n.is_read))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'dette_elevee':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'plafond_depasse':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'nouveau_paiement':
        return <CreditCard className="w-5 h-5 text-emerald-500" />
      case 'nouveau_revendeur':
        return <UserPlus className="w-5 h-5 text-blue-500" />
      case 'produit_inactif':
        return <PackageX className="w-5 h-5 text-slate-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-6 animate-in max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Bell className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Vous avez <span className="font-semibold text-foreground">{unreadCount}</span> notification(s) non lue(s)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
              <Check size={14} /> Tout marquer comme lu
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={clearRead} className="gap-2 text-red-600 hover:text-red-700">
            <Trash2 size={14} /> Effacer les lues
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-1">Vous êtes à jour</h3>
            <p className="text-sm text-muted-foreground">Aucune notification à afficher.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <Card 
              key={notif.id} 
              className={`border-0 shadow-sm transition-colors ${
                !notif.is_read ? 'bg-red-50/50 dark:bg-red-950/10' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm ${!notif.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${!notif.is_read ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                    {notif.message}
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="flex-shrink-0 flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-emerald-600 rounded-full"
                      onClick={() => markAsRead(notif.id)}
                      title="Marquer comme lu"
                    >
                      <Check size={16} />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
