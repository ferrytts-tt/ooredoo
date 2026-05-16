'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Wifi, 
  Mail, 
  Lock, 
  User,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setIsLoading(true)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // 1. Créer l'utilisateur dans Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Créer le profil dans la table profiles
        // Note: On met 'admin' par défaut pour votre test
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: form.fullName,
            email: form.email,
            role: 'admin' // Par défaut admin pour vos tests
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // On continue quand même car l'utilisateur est créé dans Auth
        }

        toast.success('Compte créé avec succès !')
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Une erreur est survenue lors de l\'inscription')
      toast.error(err.message || 'Erreur lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0c14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-[450px] relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center shadow-2xl shadow-red-600/40 mb-4 animate-in">
            <Wifi className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            Ooredoo <span className="text-red-500">Crédit</span>
          </h1>
          <p className="text-slate-400 font-medium">Création de compte administrateur</p>
        </div>

        <Card className="border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-6 border-b border-white/5">
            <CardTitle className="text-xl text-white font-bold">Inscription</CardTitle>
            <CardDescription className="text-slate-400">
              Remplissez les informations pour créer votre accès
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nom Complet</label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  <Input
                    placeholder="Ex: Ahmed Ben Salah"
                    className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/20 transition-all"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Adresse Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  <Input
                    type="email"
                    placeholder="admin@ooredoo.tn"
                    className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/20 transition-all"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mot de passe</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/20 transition-all"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Confirmation</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-red-500/50 focus:ring-red-500/20 transition-all"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg shadow-red-900/30 border-0 transition-all mt-4 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Création en cours...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Créer mon compte
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-sm text-slate-400">
                Déjà un compte ?{' '}
                <Link 
                  href="/login" 
                  className="text-white hover:text-red-500 font-bold transition-colors"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-[10px] text-muted-foreground/60 font-medium tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Ooredoo Crédit Manager. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}
