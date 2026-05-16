// Types pour la base de données Supabase
// Sera remplacé par les types générés automatiquement après connexion Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'revendeur'

export type ResellerStatus = 'actif' | 'bloque' | 'suspendu'

export type TransactionStatus = 'complete' | 'en_attente' | 'annule'

export type PaymentMethod = 'cash' | 'virement' | 'depot_bancaire' | 'cheque'

export type ProductCategory =
  | 'recharge_mobile'
  | 'forfait_data'
  | 'box_internet'
  | 'carte_recharge'
  | 'option_internet'
  | 'fibre'
  | 'promotion'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Reseller {
  id: string
  profile_id?: string
  company_name: string
  manager_name: string
  phone: string
  cin: string
  address: string
  city: string
  email: string
  status: ResellerStatus
  credit_limit: number       // Plafond de crédit
  advance_paid: number       // Avance payée
  current_debt: number       // Dette actuelle
  available_credit: number   // Crédit disponible (calculé)
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  created_at: string
}

export interface Product {
  id: string
  category_id: string
  category?: Category
  name: string
  code: string
  purchase_price: number
  sale_price: number
  commission: number
  virtual_stock: number
  status: 'actif' | 'inactif'
  description?: string
  image_url?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface Transaction {
  id: string
  reseller_id: string
  reseller?: Reseller
  product_id: string
  product?: Product
  quantity: number
  unit_price: number
  total_amount: number
  status: TransactionStatus
  debt_before: number
  debt_after: number
  notes?: string
  created_by: string
  created_at: string
}

export interface Payment {
  id: string
  reseller_id: string
  reseller?: Reseller
  amount: number
  method: PaymentMethod
  reference?: string
  debt_before: number
  debt_after: number
  notes?: string
  created_by: string
  created_at: string
  receipt_url?: string
}

export interface CreditLog {
  id: string
  reseller_id: string
  reseller?: Reseller
  previous_limit: number
  new_limit: number
  reason?: string
  created_by: string
  created_at: string
}

export interface Notification {
  id: string
  user_id?: string
  type: 'dette_elevee' | 'plafond_depasse' | 'nouveau_paiement' | 'nouveau_revendeur' | 'produit_inactif' | 'info'
  title: string
  message: string
  is_read: boolean
  metadata?: Json
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  user_email?: string
  action: string
  resource_type: string
  resource_id?: string
  old_values?: Json
  new_values?: Json
  ip_address?: string
  created_at: string
}

// Dashboard stats
export interface DashboardStats {
  total_credit_granted: number
  total_debt: number
  today_revenue: number
  total_resellers: number
  active_resellers: number
  blocked_resellers: number
  monthly_transactions: number
  debt_alert_count: number
}

export interface SalesChartData {
  date: string
  sales: number
  payments: number
}

export interface TopReseller {
  id: string
  company_name: string
  total_purchases: number
  current_debt: number
  status: ResellerStatus
}
