import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/types/database'

export const notificationService = {
  // Récupérer les notifications initiales
  async getNotifications(limit = 10) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as Notification[]
  },

  // S'abonner aux nouvelles notifications en temps réel
  subscribeToNotifications(callback: (notification: Notification) => void) {
    const supabase = createClient()
    
    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          callback(payload.new as Notification)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  // Marquer comme lu
  async markAsRead(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    
    if (error) throw error
  }
}
