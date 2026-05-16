import { createClient } from '@/lib/supabase/client'
import type { Reseller, ResellerStatus } from '@/types/database'

export const resellerService = {
  /**
   * Récupère tous les revendeurs
   */
  async getAll() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('resellers')
      .select('id, company_name, manager_name, phone, city, cin, email, status, credit_limit, advance_paid, current_debt, available_credit, created_at')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Reseller[]
  },

  /**
   * Récupère le nombre total de revendeurs
   */
  async getCount() {
    const supabase = createClient()
    const { count, error } = await supabase
      .from('resellers')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    return count || 0
  },

  /**
   * Crée un nouveau revendeur
   */
  async create(reseller: Partial<Reseller>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('resellers')
      .insert(reseller)
      .select()
      .single()
    
    if (error) throw error
    return data as Reseller
  },

  /**
   * Met à jour un revendeur
   */
  async update(id: string, updates: Partial<Reseller>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('resellers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Reseller
  },

  /**
   * Change le statut d'un revendeur
   */
  async updateStatus(id: string, status: ResellerStatus) {
    const supabase = createClient()
    const { error } = await supabase
      .from('resellers')
      .update({ status })
      .eq('id', id)
    
    if (error) throw error
  }
}
