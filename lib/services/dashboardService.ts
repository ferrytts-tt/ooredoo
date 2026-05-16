import { createClient } from '@/lib/supabase/client'
import type { DashboardStats } from '@/types/database'

export const dashboardService = {
  /**
   * Récupère les statistiques globales pour le dashboard admin
   */
  async getStats(): Promise<DashboardStats> {
    const supabase = createClient()
    
    // 1. Récupérer les revendeurs (Crédits et Dettes)
    const { data: resellers, error: resellersError } = await supabase
      .from('resellers')
      .select('credit_limit, current_debt, status')
    
    if (resellersError) throw resellersError

    // 2. Récupérer le nombre total de transactions du mois
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: transactionsCount, error: txError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    if (txError) throw txError

    // 3. Récupérer les revenus d'aujourd'hui (somme des paiements)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: todayPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .gte('created_at', today.toISOString())

    if (paymentsError) throw paymentsError

    // 4. Compter les alertes (dette > 80% du plafond)
    const debtAlerts = resellers.filter(r => 
      (Number(r.current_debt) || 0) >= (Number(r.credit_limit) || 0) * 0.8
    ).length

    const totalCredit = resellers.reduce((acc, r) => acc + (Number(r.credit_limit) || 0), 0)
    const totalDebt = resellers.reduce((acc, r) => acc + (Number(r.current_debt) || 0), 0)
    const todayRevenue = todayPayments?.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) || 0
    const activeCount = resellers.filter(r => r.status === 'actif').length
    const blockedCount = resellers.filter(r => r.status === 'bloque').length

    return {
      total_credit_granted: totalCredit,
      total_debt: totalDebt,
      today_revenue: todayRevenue,
      total_resellers: resellers.length,
      active_resellers: activeCount,
      blocked_resellers: blockedCount,
      monthly_transactions: transactionsCount || 0,
      debt_alert_count: debtAlerts || 0,
    }
  },

  /**
   * Récupère les transactions récentes pour approbation
   */
  async getPendingTransactions() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id, 
        quantity, 
        total_amount, 
        created_at, 
        status,
        resellers(company_name), 
        products(name)
      `)
      .eq('status', 'en_attente')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) throw error
    return data
  }
}
