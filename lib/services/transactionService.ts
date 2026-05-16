import { createClient } from '@/lib/supabase/client'
import type { Transaction } from '@/types/database'

export const transactionService = {
  /**
   * Récupère toutes les transactions (Admin)
   */
  async getAll() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transactions')
      .select('*, resellers(company_name), products(name)')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  /**
   * Récupère les transactions d'un revendeur spécifique
   */
  async getByReseller(resellerId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transactions')
      .select('*, products(name)')
      .eq('reseller_id', resellerId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  /**
   * Crée une nouvelle transaction
   */
  async create(transaction: Partial<Transaction>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Approuve une transaction
   */
  async approve(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'complete' })
      .eq('id', id)
    
    if (error) throw error
  },

  /**
   * Annule une transaction
   */
  async cancel(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'annule' })
      .eq('id', id)
    
    if (error) throw error
  },

  /**
   * Met à jour la note d'une transaction
   */
  async updateNote(id: string, note: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('transactions')
      .update({ notes: note })
      .eq('id', id)
    
    if (error) throw error
  }
}
