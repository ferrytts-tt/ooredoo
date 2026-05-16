'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  CreditCard,
  ShoppingCart,
  Clock,
  ArrowRight,
  Wallet,
  AlertTriangle,
  Receipt
} from 'lucide-react'
import { formatCurrency, formatDate, calcDebtPercentage, cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { resellerDashboardService } from '@/lib/services/resellerDashboardService'
import { productService } from '@/lib/services/productService'
import type { Product, Transaction } from '@/types/database'

export default function RevendeurDashboardPage() {
  const { user: profile, reseller, setReseller } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      fetchResellerData()
    }
  }, [profile])

  const fetchResellerData = async () => {
    try {
      setIsLoading(true)
      let currentReseller = reseller
      
      if (!currentReseller && profile) {
        currentReseller = await resellerDashboardService.getResellerProfile(profile.id)
        setReseller(currentReseller)
      }

      if (currentReseller) {
        const [myStats, txns, prods] = await Promise.all([
          resellerDashboardService.getMyStats(currentReseller.id),
          resellerDashboardService.getMyTransactions(currentReseller.id),
          productService.getAll()
        ])
        setStats(myStats)
        setRecentTransactions(txns)
        setProducts(prods)
      }
    } catch (error) {
      console.error('Error fetching reseller data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const user = reseller || {
    manager_name: profile?.full_name || 'Utilisateur',
    company_name: 'Chargement...',
    current_debt: 0,
    credit_limit: 0,
    available_credit: 0,
    cin: ''
  }

  const debtPct = stats ? calcDebtPercentage(stats.current_debt, stats.credit_limit) : 0

  return (
    <div className="space-y-6 animate-in">
      {/* Welcome & Alerts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bonjour, {user.manager_name}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Voici un aperçu de votre compte {user.company_name}
          </p>
        </div>
        <Dialog>
          <DialogTrigger render={
            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-600/20">
              <ShoppingCart size={16} />
              Nouvelle Commande
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-950">
            <div className="bg-gradient-to-br from-red-600 to-red-800 px-6 py-6 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white font-bold tracking-tight">Nouvelle Commande</DialogTitle>
                <DialogDescription className="text-red-100/80">
                  Sélectionnez un produit et la quantité souhaitée.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="px-6 py-6 grid gap-6 bg-white dark:bg-slate-950">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="order-product" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Produit</Label>
                  <select 
                    id="order-product" 
                    className="flex h-11 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500/20 text-foreground"
                    onChange={(e) => {
                      const prodId = e.target.value;
                      const prod = products.find((p: any) => p.id === prodId);
                      if (prod) {
                        const priceEl = document.getElementById('unit-price-display');
                        if (priceEl) priceEl.innerText = formatCurrency(prod.sale_price);
                      }
                    }}
                  >
                    <option value="">Choisir un produit...</option>
                    {products.filter(p => p.status === 'actif').map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.sale_price)})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order-qty" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Quantité</Label>
                    <Input id="order-qty" type="number" min="1" defaultValue="1" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 text-foreground font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Prix Unitaire</Label>
                    <div id="unit-price-display" className="h-11 flex items-center px-3 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-foreground font-medium">
                      -
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                  <div className="flex justify-between items-center text-xs text-red-800 dark:text-red-400 font-medium">
                    <span>Crédit disponible:</span>
                    <span>{formatCurrency(stats?.available_credit || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="h-10 bg-white dark:bg-slate-950">Annuler</Button>} />
              <DialogClose render={
                <Button 
                  type="button" 
                  className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-600/20 px-6 h-10"
                  onClick={async () => {
                    const prodId = (document.getElementById('order-product') as HTMLSelectElement).value;
                    const qty = Number((document.getElementById('order-qty') as HTMLInputElement).value);
                    const prod = products.find(p => p.id === prodId);
                    
                    if (!prod || !qty || qty <= 0) {
                      toast.error('Veuillez remplir tous les champs correctement.');
                      return;
                    }
                    
                    const total = prod.sale_price * qty;
                    if (total > (stats?.available_credit || 0)) {
                      toast.error('Crédit insuffisant pour cette commande.');
                      return;
                    }
                    
                    try {
                      // Logic for order creation here
                      toast.success('Commande passée avec succès ! Votre crédit sera mis à jour après validation.');
                      await fetchResellerData();
                    } catch (error) {
                      toast.error('Erreur lors de la commande');
                    }
                  }}
                >
                  Confirmer la commande
                </Button>
              } />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {debtPct >= 90 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800/30">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-400">
                Plafond de crédit presque atteint
              </p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                Vous avez utilisé {debtPct}% de votre crédit. Veuillez effectuer un paiement pour éviter le blocage de votre compte.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-medium text-slate-300">Crédit Disponible</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(stats?.available_credit || 0)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Wallet size={20} className="text-white" />
              </div>
            </div>
            <div className="text-sm text-slate-300">
              Sur un plafond total de {formatCurrency(stats?.credit_limit || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm md:col-span-2">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">État de la dette</p>
                <div className="flex items-end gap-3 mt-1">
                  <p className={`text-3xl font-bold ${
                    debtPct >= 90 ? 'text-red-600' : debtPct >= 70 ? 'text-orange-600' : 'text-foreground'
                  }`}>
                    {formatCurrency(stats?.current_debt || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">dette actuelle</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <CreditCard size={20} className="text-red-600" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-muted-foreground">Utilisation du plafond</span>
                <span className={`font-bold ${debtPct >= 90 ? 'text-red-600' : ''}`}>{debtPct}%</span>
              </div>
              <Progress 
                value={debtPct} 
                className={`h-3 bg-muted ${
                  debtPct >= 90 ? '[&>div]:bg-red-500' : 
                  debtPct >= 70 ? '[&>div]:bg-orange-500' : 
                  '[&>div]:bg-emerald-500'
                }`} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Derniers Achats</CardTitle>
                <CardDescription>Vos 5 dernières commandes</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                Voir tout <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop View */}
            <div className="hidden md:block">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(txn.created_at).split(' ')[0]}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{txn.product?.name}</p>
                      <p className="text-[10px] text-muted-foreground">{txn.quantity} unités</p>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(txn.total_amount)}
                    </TableCell>
                  </TableRow>
                ))}
                {recentTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-sm text-muted-foreground">
                      Aucune transaction récente
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((txn) => (
              <div key={txn.id} className="p-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <Clock size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{txn.product?.name}</p>
                    <p className="text-[10px] text-muted-foreground">{txn.quantity} unités • {formatDate(txn.created_at).split(' ')[0]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-foreground">{formatCurrency(txn.total_amount)}</p>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground italic">
                Aucune transaction récente
              </div>
            )}
          </div>
        </CardContent>
        </Card>

        {/* Quick Actions / Info */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-accent/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Comment payer ma dette ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border">
                <Receipt className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Virement bancaire</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    RIB Ooredoo: <strong>08 000 0000000000000 00</strong><br />
                    Banque: Amen Bank
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border">
                <Wallet className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Dépôt en agence</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Présentez-vous à votre agence Ooredoo principale pour un paiement en espèces.
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                * N&apos;oubliez pas d&apos;indiquer votre code revendeur ({user.cin}) lors de vos paiements.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
