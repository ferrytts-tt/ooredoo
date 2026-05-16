import { createClient } from '@/lib/supabase/client'
import type { Payment } from '@/types/database'

export const paymentService = {
  /**
   * Récupère tous les paiements (Admin)
   */
  async getAll() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('payments')
      .select('*, resellers(company_name)')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  /**
   * Récupère les paiements d'un revendeur spécifique
   */
  async getByReseller(resellerId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('reseller_id', resellerId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  /**
   * Enregistre un nouveau paiement
   */
  async create(payment: Partial<Payment>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
