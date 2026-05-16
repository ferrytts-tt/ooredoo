import { create } from 'zustand'
import { Notification } from '@/types/database'
import { notificationService } from '@/lib/services/notificationService'
import { toast } from 'sonner'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  fetchNotifications: () => Promise<void>
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true })
    try {
      const data = await notificationService.getNotifications()
      const unreadCount = data.filter(n => !n.is_read).length
      set({ notifications: data, unreadCount, isLoading: false })
    } catch (error) {
      console.error('Error fetching notifications:', error)
      set({ isLoading: false })
    }
  },

  addNotification: (notification) => {
    const { notifications, unreadCount } = get()
    // Éviter les doublons
    if (notifications.some(n => n.id === notification.id)) return

    set({ 
      notifications: [notification, ...notifications],
      unreadCount: unreadCount + 1
    })

    // Afficher un toast élégant
    toast(notification.title, {
      description: notification.message,
      action: {
        label: 'Voir',
        onClick: () => window.location.href = '/notifications'
      }
    })
  },

  markAsRead: async (id) => {
    try {
      await notificationService.markAsRead(id)
      const { notifications, unreadCount } = get()
      const updatedNotifications = notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      )
      set({ 
        notifications: updatedNotifications, 
        unreadCount: Math.max(0, unreadCount - 1) 
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }
}))
