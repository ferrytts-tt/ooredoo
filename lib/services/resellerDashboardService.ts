import { supabase } from '@/lib/supabase/client'
import type { Reseller, Transaction, Payment, Product } from '@/types/database'

export const resellerDashboardService = {
  async getResellerProfile(userId: string) {
    const { data, error } = await supabase
      .from('resellers')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // Fallback: try by email if user_id is not set
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user?.email) {
        const { data: byEmail, error: emailError } = await supabase
          .from('resellers')
          .select('*')
          .eq('email', userData.user.email)
          .single()
        
        if (!emailError) return byEmail
      }
      throw error
    }
    return data
  },

  async getMyStats(resellerId: string) {
    const { data: reseller, error } = await supabase
      .from('resellers')
      .select('current_debt, credit_limit')
      .eq('id', resellerId)
      .single()

    if (error) throw error

    // Get last transactions count
    const { count: txCount } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('reseller_id', resellerId)

    return {
      current_debt: reseller.current_debt,
      credit_limit: reseller.credit_limit,
      available_credit: reseller.credit_limit - reseller.current_debt,
      total_transactions: txCount || 0
    }
  },

  async getMyTransactions(resellerId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        product:products(*)
      `)
      .eq('reseller_id', resellerId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    return data
  },

  async getMyPayments(resellerId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('reseller_id', resellerId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    return data
  }
}
