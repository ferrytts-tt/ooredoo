import { createClient } from '@/lib/supabase/client'
import type { Product, Category } from '@/types/database'

export const productService = {
  /**
   * Récupère tous les produits avec leurs catégories
   */
  async getAll() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)')
      .order('name')
    
    if (error) throw error
    return data as (Product & { categories: Category })[]
  },

  /**
   * Récupère toutes les catégories
   */
  async getCategories() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data as Category[]
  },

  /**
   * Crée un nouveau produit
   */
  async create(product: Partial<Product>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()
    
    if (error) throw error
    return data as Product
  },

  /**
   * Met à jour un produit
   */
  async update(id: string, updates: Partial<Product>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Product
  },

  /**
   * Supprime un produit (Soft delete recommandé en prod, ici direct pour l'instant)
   */
  async delete(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
