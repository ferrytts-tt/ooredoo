import { createClient } from '@/lib/supabase/client'
import type { DashboardStats } from '@/types/database'

export const dashboardService = {
  /**
   * Récupère les statistiques globales pour le dashboard admin
   */
  async getStats(): Promise<DashboardStats> {
    const supabase = createClient()
    
    // On récupère les données brutes pour calculer les stats
    const { data: resellers, error: resellersError } = await supabase
      .from('resellers')
      .select('credit_limit, current_debt, status')
    
    if (resellersError) throw resellersError

    const { count: transactionsCount, error: txError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })

    if (txError) throw txError

    const { count: debtAlerts, error: alertError } = await supabase
      .from('resellers')
      .select('*', { count: 'exact', head: true })
      .gt('current_debt', 10000) // Exemple: dette > 10k DT

    if (alertError) throw alertError

    const totalCredit = resellers.reduce((acc, r) => acc + (Number(r.credit_limit) || 0), 0)
    const totalDebt = resellers.reduce((acc, r) => acc + (Number(r.current_debt) || 0), 0)
    const activeCount = resellers.filter(r => r.status === 'actif').length
    const blockedCount = resellers.filter(r => r.status === 'bloque').length

    return {
      total_credit_granted: totalCredit,
      total_debt: totalDebt,
      today_revenue: 0, // À calculer depuis les transactions du jour
      total_resellers: resellers.length,
      active_resellers: activeCount,
      blocked_resellers: blockedCount,
      monthly_transactions: transactionsCount || 0,
      debt_alert_count: debtAlerts || 0,
    }
  },

  /**
   * Récupère les notifications récentes
   */
  async getNotifications() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) throw error
    return data
  },

  /**
   * Récupère les commandes en attente
   */
  async getPendingTransactions() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transactions')
      .select('*, resellers(company_name), products(name)')
      .eq('status', 'en_attente')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}
