import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, UserRole, Reseller } from '@/types/database'

interface AuthState {
  user: Profile | null
  reseller: Reseller | null
  role: UserRole | null
  isLoading: boolean
  setUser: (user: Profile | null) => void
  setReseller: (reseller: Reseller | null) => void
  setRole: (role: UserRole | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      reseller: null,
      role: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setReseller: (reseller) => set({ reseller }),
      setRole: (role) => set({ role }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, reseller: null, role: null }),
    }),
    {
      name: 'ooredoo-auth-storage',
      partialize: (state) => ({ user: state.user, reseller: state.reseller, role: state.role }),
    }
  )
)
