'use client'


import {
  Search,
  ShoppingCart,
  Filter,
  CheckCircle2,
  Info,
  Package
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { productService } from '@/lib/services/productService'
import { resellerDashboardService } from '@/lib/services/resellerDashboardService'
import { transactionService } from '@/lib/services/transactionService'
import type { Product, Category } from '@/types/database'

export default function ResellerCataloguePage() {
  const { user: profile, reseller, setReseller } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

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

      const [prods, cats] = await Promise.all([
        productService.getAll(),
        productService.getCategories()
      ])
      
      setProducts(prods)
      setCategories(cats)

      if (currentReseller) {
        const myStats = await resellerDashboardService.getMyStats(currentReseller.id)
        setStats(myStats)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter
    const isActive = product.status === 'actif'

    return matchesSearch && matchesCategory && isActive
  })

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="text-red-600" />
            Catalogue Produits
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Découvrez nos offres et passez vos commandes en un clic.
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 px-4 py-2 rounded-xl flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Crédit Disponible</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(stats?.available_credit || 0)}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
            <ShoppingCart size={14} className="text-white" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11 bg-white dark:bg-slate-900 border-border"
              />
            </div>
            <div className="flex items-center gap-2 w-full overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <Button 
                variant={categoryFilter === 'all' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setCategoryFilter('all')}
                className={categoryFilter === 'all' ? 'bg-red-600 text-white hover:bg-red-700 border-0' : 'h-11'}
              >
                Tous
              </Button>
              {categories.map(cat => (
                <Button 
                  key={cat.id}
                  variant={categoryFilter === cat.id ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={categoryFilter === cat.id ? 'bg-red-600 text-white hover:bg-red-700 border-0' : 'h-11 whitespace-nowrap'}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Image Section */}
            <div className="relative h-48 w-full overflow-hidden bg-muted">
              <img 
                src={product.image_url || 'https://via.placeholder.com/400x300'} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <Badge className="bg-white/90 text-slate-900 backdrop-blur-md border-0 font-bold shadow-sm">
                  {product.category?.name}
                </Badge>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-xs font-medium line-clamp-2">
                  {product.description || `Offre Ooredoo : ${product.name}`}
                </p>
              </div>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                  {product.name}
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono border-slate-200 dark:border-slate-800 shrink-0">
                  {product.code}
                </Badge>
              </div>
              
              <div className="mt-auto pt-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Prix Public</p>
                  <p className="text-xl font-black text-red-600">
                    {formatCurrency(product.sale_price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Stock</p>
                  <p className="text-xs font-semibold text-emerald-600">Disponible</p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-5 pt-0">
              <Dialog>
                <DialogTrigger render={
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 gap-2 h-11 rounded-xl shadow-lg shadow-slate-900/10 transition-all active:scale-95">
                    <ShoppingCart size={16} />
                    Commander
                  </Button>
                } />
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-950">
                  <div className="bg-gradient-to-br from-red-600 to-red-800 px-6 py-8 text-white relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <DialogHeader>
                      <DialogTitle className="text-2xl text-white font-bold tracking-tight">Confirmer la commande</DialogTitle>
                      <DialogDescription className="text-red-100/80">
                        {product.name} - {formatCurrency(product.sale_price)} / unité
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  
                  <div className="px-6 py-8 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`qty-${product.id}`} className="text-slate-700 dark:text-slate-200 font-bold text-sm">Quantité à commander</Label>
                        <Input 
                          id={`qty-${product.id}`} 
                          type="number" 
                          min="1" 
                          defaultValue="1" 
                          className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 font-bold text-lg text-foreground"
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const totalEl = document.getElementById(`total-${product.id}`);
                            if (totalEl) totalEl.innerText = formatCurrency(val * product.sale_price);
                          }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div>
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total à payer</p>
                          <p id={`total-${product.id}`} className="text-2xl font-black text-red-600">
                            {formatCurrency(product.sale_price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Crédit après achat</p>
                          <p className="text-xs font-bold text-slate-500">
                            {formatCurrency((stats?.available_credit || 0) - product.sale_price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter className="px-6 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                    <DialogClose render={<Button type="button" variant="outline" className="h-12 px-6 rounded-xl border-slate-200">Annuler</Button>} />
                    <DialogClose render={
                      <Button 
                        className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-xl shadow-red-600/20 px-8 h-12 rounded-xl transition-all active:scale-95"
                        onClick={async () => {
                          const qty = Number((document.getElementById(`qty-${product.id}`) as HTMLInputElement).value);
                          if (qty > 0) {
                            const total = qty * product.sale_price;
                            if (total > (stats?.available_credit || 0)) {
                              toast.error('Crédit insuffisant !');
                              return;
                            }
                            
                            try {
                              await transactionService.create({
                                reseller_id: reseller?.id,
                                product_id: product.id,
                                quantity: qty,
                                unit_price: product.sale_price,
                                total_amount: total,
                                status: 'complete',
                                created_by: 'reseller'
                              });
                              toast.success(`Commande de ${qty} x ${product.name} effectuée !`);
                              fetchData();
                            } catch (error) {
                              toast.error('Erreur lors de la commande');
                            }
                          }
                        }}
                      >
                        Valider l&apos;achat
                      </Button>
                    } />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Package size={40} className="text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Aucun produit trouvé</h2>
          <p className="text-muted-foreground max-w-xs mt-2">
            Essayez de modifier vos filtres ou votre recherche pour trouver ce que vous cherchez.
          </p>
          <Button variant="link" className="mt-4 text-red-600" onClick={() => {setSearchTerm(''); setCategoryFilter('all');}}>
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  )
}
