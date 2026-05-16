import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  mockTransactions, 
  mockPayments, 
  mockResellers, 
  mockProducts 
} from './data/mockData'
import { Transaction, Payment, Reseller, Product } from '@/types/database'

interface AppState {
  transactions: Transaction[]
  payments: Payment[]
  resellers: Reseller[]
  products: Product[]
  
  // Actions
  addTransaction: (tx: Transaction) => void
  updateTransactionStatus: (id: string, status: Transaction['status']) => void
  addPayment: (payment: Payment) => void
  updateResellerDebt: (resellerId: string, amount: number, type: 'add' | 'subtract') => void
  updateTransactionNote: (id: string, note: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      transactions: mockTransactions,
      payments: mockPayments,
      resellers: mockResellers,
      products: mockProducts,

      addTransaction: (tx) => 
        set((state) => ({ 
          transactions: [tx, ...state.transactions] 
        })),

      updateTransactionStatus: (id, status) =>
        set((state) => ({
          transactions: state.transactions.map((t) => 
            t.id === id ? { ...t, status } : t
          )
        })),

      addPayment: (payment) =>
        set((state) => ({
          payments: [payment, ...state.payments],
          resellers: state.resellers.map((r) => {
            if (r.id === payment.reseller_id) {
              const newDebt = r.current_debt - payment.amount
              return {
                ...r,
                current_debt: newDebt,
                available_credit: r.credit_limit - newDebt
              }
            }
            return r
          })
        })),

      updateResellerDebt: (resellerId, amount, type) =>
        set((state) => ({
          resellers: state.resellers.map((r) => {
            if (r.id === resellerId) {
              const newDebt = type === 'add' ? r.current_debt + amount : r.current_debt - amount
              return {
                ...r,
                current_debt: newDebt,
                available_credit: r.credit_limit - newDebt
              }
            }
            return r
          })
        })),

      updateTransactionNote: (id, note) =>
        set((state) => ({
          transactions: state.transactions.map((t) => 
            t.id === id ? { ...t, note } : t
          )
        })),
    }),
    {
      name: 'ooredoo-credit-storage',
    }
  )
)
