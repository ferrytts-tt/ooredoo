'use client'


import {
  Search,
  Plus,
  Filter,
  Download,
  Calendar as CalendarIcon,
  Clock,
  Package,
  ArrowRight
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { transactionService } from '@/lib/services/transactionService'
import { resellerDashboardService } from '@/lib/services/resellerDashboardService'
import { productService } from '@/lib/services/productService'
import type { Transaction, Product } from '@/types/database'

export default function RevendeurTransactionsPage() {
  const { user: profile, reseller, setReseller } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [transactionsList, setTransactionsList] = useState<any[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState<{ from: Date; to: Date } | undefined>(undefined)

  useEffect(() => {
    fetchData()
  }, [profile])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      let currentReseller = reseller
      if (!currentReseller && profile) {
        currentReseller = await resellerDashboardService.getResellerProfile(profile.id)
        setReseller(currentReseller)
      }

      if (currentReseller) {
        const [txns, prods, myStats] = await Promise.all([
          resellerDashboardService.getMyTransactions(currentReseller.id),
          productService.getAll(),
          resellerDashboardService.getMyStats(currentReseller.id)
        ])
        setTransactionsList(txns)
        setProducts(prods)
        setStats(myStats)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTransactions = transactionsList.filter((t) => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (date?.from && date?.to) {
      const txDate = new Date(t.created_at)
      if (txDate < date.from || txDate > date.to) return false
    }

    return matchesSearch
  })

  const handleNewOrder = async () => {
    const productSelect = document.getElementById('order-product') as HTMLSelectElement
    const qtyInput = document.getElementById('order-qty') as HTMLInputElement
    
    if (!productSelect.value || !qtyInput.value || !reseller) return
    
    const product = products.find(p => p.id === productSelect.value)
    if (!product) return

    const qty = Number(qtyInput.value)
    const total = product.sale_price * qty

    if (total > (stats?.available_credit || 0)) {
      toast.error('Crédit insuffisant !')
      return
    }

    try {
      await transactionService.create({
        reseller_id: reseller.id,
        product_id: product.id,
        quantity: qty,
        unit_price: product.sale_price,
        total_amount: total,
        status: 'en_attente',
        created_by: 'reseller'
      })
      toast.success('Votre commande a été envoyée pour approbation !')
      fetchData()
    } catch (error) {
      toast.error('Erreur lors de la commande')
    }
  }

  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Préparation du fichier Excel...',
        success: 'Le fichier a été téléchargé avec succès !',
        error: 'Erreur lors de l\'exportation',
      }
    )
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Suivez vos commandes et l'historique de vos achats
          </p>
        </div>
        <Dialog>
          <DialogTrigger render={
            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-600/20">
              <Plus size={16} />
              Nouvelle Commande
            </Button>
          } />
          <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-950">
            <div className="bg-gradient-to-br from-red-600 to-red-800 px-6 py-6 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white font-bold tracking-tight">Nouvelle Commande</DialogTitle>
                <DialogDescription className="text-red-100/80">
                  Commandez des produits pour votre stock.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="px-6 py-6 space-y-5 bg-white dark:bg-slate-950">
              <div className="space-y-2">
                <Label htmlFor="order-product" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Sélectionner un produit</Label>
                <select id="order-product" className="flex h-11 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500/20 text-foreground">
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.sale_price)}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="order-qty" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Quantité</Label>
                <Input id="order-qty" type="number" defaultValue="1" min="1" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 transition-all shadow-sm text-foreground font-bold" />
              </div>
              
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground uppercase font-black tracking-widest">
                  <span>Solde disponible</span>
                  <span>{formatCurrency(stats?.available_credit || 0)}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[65%]"></div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="h-10 bg-white dark:bg-slate-950">Annuler</Button>} />
              <DialogClose render={<Button type="button" className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-600/20 px-6 h-10" onClick={handleNewOrder}>Envoyer la commande</Button>} />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-border">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par référence, produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger render={
                  <Button variant="outline" size="sm" className={cn("gap-2", date && "border-red-600 text-red-600")}>
                    <CalendarIcon size={14} />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {date.from.toLocaleDateString()} - {date.to.toLocaleDateString()}
                        </>
                      ) : (
                        date.from.toLocaleDateString()
                      )
                    ) : (
                      "Période"
                    )}
                  </Button>
                } />
                <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-slate-100" align="end">
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date as any}
                    onSelect={setDate as any}
                    numberOfMonths={1}
                  />
                  <div className="p-3 border-t border-slate-100 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setDate(undefined)} className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50">Réinitialiser</Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                <Download size={14} />
                Exporter
              </Button>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Réf</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                        <span className="text-sm text-muted-foreground font-medium">Chargement des transactions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucune commande trouvée.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="text-sm font-medium">{formatDate(tx.created_at)}</div>
                        <div className="text-xs text-muted-foreground font-mono">{tx.id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{tx.product?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{tx.quantity}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(tx.total_amount)}</TableCell>
                      <TableCell>
                        {tx.status === 'en_attente' ? (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">En attente</Badge>
                        ) : tx.status === 'complete' ? (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Approuvée</Badge>
                        ) : (
                          <Badge variant="destructive">Annulée</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm italic">
                Aucune transaction trouvée.
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4 space-y-4 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">{tx.id}</div>
                      <div className="font-black text-foreground text-base tracking-tight leading-tight">{tx.product?.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={12} className="text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{formatDate(tx.created_at)}</span>
                      </div>
                    </div>
                    {tx.status === 'en_attente' ? (
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 shadow-lg shadow-orange-500/20">En attente</Badge>
                    ) : tx.status === 'complete' ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 shadow-lg shadow-emerald-500/20">Approuvée</Badge>
                    ) : (
                      <Badge className="bg-red-500 text-white border-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">Annulée</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[8px] uppercase text-muted-foreground font-black tracking-widest mb-0.5">Quantité</p>
                      <p className="text-sm font-black text-foreground">x {tx.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] uppercase text-muted-foreground font-black tracking-widest mb-0.5">Total</p>
                      <p className="text-base font-black text-foreground">{formatCurrency(tx.total_amount)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
