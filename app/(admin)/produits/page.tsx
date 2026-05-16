'use client'

import { useState } from 'react'
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { mockProducts, mockCategories } from '@/lib/data/mockData'
import { formatCurrency, cn } from '@/lib/utils'
import { useEffect } from 'react'
import { productService } from '@/lib/services/productService'
import type { Product, Category } from '@/types/database'

export default function ProduitsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [productsList, setProductsList] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [prods, cats] = await Promise.all([
        productService.getAll(),
        productService.getCategories()
      ])
      setProductsList(prods)
      setCategories(cats)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Erreur lors du chargement des produits')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = productsList.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produits Ooredoo</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez votre catalogue de produits et les commissions
          </p>
        </div>
        <Dialog>
          <DialogTrigger render={
            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-600/20">
              <Plus size={16} />
              Nouveau produit
            </Button>
          } />
          <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-950">
            <div className="bg-gradient-to-br from-red-600 to-red-800 px-6 py-6 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white font-bold tracking-tight">Ajouter un produit</DialogTitle>
                <DialogDescription className="text-red-100/80">
                  Créez un nouveau produit pour le catalogue Ooredoo.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="px-6 py-6 grid gap-5 bg-white dark:bg-slate-950">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prod-name" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Nom du produit</Label>
                  <Input id="prod-name" placeholder="Ex: Recharge 50 TND" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 transition-all shadow-sm text-foreground" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prod-code" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Code</Label>
                    <Input id="prod-code" placeholder="Ex: RCH-50" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 transition-all shadow-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-cat" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Catégorie</Label>
                    <Input id="prod-cat" placeholder="Ex: Recharge Mobile" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 transition-all shadow-sm text-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prod-buy" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Prix Achat (DT)</Label>
                    <Input id="prod-buy" type="number" defaultValue="45" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 transition-all shadow-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-sell" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Prix Vente (DT)</Label>
                    <Input id="prod-sell" type="number" defaultValue="50" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 transition-all shadow-sm text-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prod-img" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">URL de l&apos;image</Label>
                  <Input id="prod-img" placeholder="https://..." className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 transition-all shadow-sm text-foreground" />
                </div>
              </div>
            </div>
            
            <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="h-10 bg-white dark:bg-slate-950">Annuler</Button>} />
              <DialogClose render={<Button type="button" className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-600/20 px-6 h-10" onClick={async () => {
                const name = (document.getElementById('prod-name') as HTMLInputElement).value;
                const code = (document.getElementById('prod-code') as HTMLInputElement).value;
                const buy = Number((document.getElementById('prod-buy') as HTMLInputElement).value);
                const sell = Number((document.getElementById('prod-sell') as HTMLInputElement).value);
                
                try {
                  const newProduct = {
                    name: name || 'Nouveau Produit',
                    code: code || 'NEW',
                    category_id: categories.find(c => c.name.toLowerCase().includes('recharge'))?.id || categories[0]?.id,
                    purchase_price: buy || 0,
                    sale_price: sell || 0,
                    commission: (sell || 0) - (buy || 0),
                    status: 'actif' as const,
                    image_url: (document.getElementById('prod-img') as HTMLInputElement).value || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=400&auto=format&fit=crop',
                    virtual_stock: 1000
                  };
                  await productService.create(newProduct);
                  await fetchData();
                  toast.success('Produit ajouté avec succès !');
                } catch (error) {
                  toast.error('Erreur lors de la création');
                }
              }}>Créer le produit</Button>} />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-border">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              <Button 
                variant={categoryFilter === 'all' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setCategoryFilter('all')}
                className={categoryFilter === 'all' ? 'bg-slate-800 text-white' : ''}
              >
                Tous
              </Button>
              {categories.map(cat => (
                <Button 
                  key={cat.id}
                  variant={categoryFilter === cat.id ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={categoryFilter === cat.id ? 'bg-slate-800 text-white' : ''}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Prix Achat</TableHead>
                  <TableHead className="text-right">Prix Vente</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                        <span className="text-sm text-muted-foreground font-medium">Chargement des produits...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun produit trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                       <Badge variant="secondary" className="font-mono text-xs">{product.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-muted">
                            <img src={product.image_url || 'https://via.placeholder.com/40'} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{product.name}</div>
                            {product.virtual_stock < 1000 && (
                              <div className="text-[10px] text-orange-500">Stock: {product.virtual_stock}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{product.category?.name}</div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(product.purchase_price)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.sale_price)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600">
                        {formatCurrency(product.commission)}
                      </TableCell>
                      <TableCell>
                        {product.status === 'actif' ? (
                          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 gap-1 pr-2">
                            <CheckCircle2 size={12} /> Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 pr-2">
                            <XCircle size={12} /> Inactif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
                            <MoreVertical className="h-5 w-5 text-slate-500" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => setEditingProduct(product)}>
                              <Edit className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            {product.status === 'actif' ? (
                              <DropdownMenuItem className="cursor-pointer text-orange-600 focus:text-orange-600" onClick={async () => {
                                try {
                                  await productService.update(product.id, { status: 'inactif' });
                                  setProductsList(productsList.map(p => p.id === product.id ? {...p, status: 'inactif'} : p));
                                  toast.success("Produit désactivé")
                                } catch (error) {
                                  toast.error("Erreur")
                                }
                              }}>
                                Désactiver
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="cursor-pointer text-emerald-600 focus:text-emerald-600" onClick={async () => {
                                try {
                                  await productService.update(product.id, { status: 'actif' });
                                  setProductsList(productsList.map(p => p.id === product.id ? {...p, status: 'actif'} : p));
                                  toast.success("Produit activé")
                                } catch (error) {
                                  toast.error("Erreur")
                                }
                              }}>
                                Activer
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm italic">
                Aucun produit trouvé.
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="p-4 space-y-4 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0 bg-muted shadow-sm">
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-black text-foreground text-base tracking-tight leading-tight">{product.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[9px] font-mono px-1.5 py-0">#{product.code}</Badge>
                          <span className="text-[10px] text-muted-foreground">{product.category?.name}</span>
                        </div>
                      </div>
                    </div>
                    {product.status === 'actif' ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <p className="text-[8px] uppercase text-muted-foreground font-black tracking-widest mb-0.5 text-center">Vente</p>
                      <p className="text-xs font-black text-foreground text-center">{formatCurrency(product.sale_price)}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <p className="text-[8px] uppercase text-muted-foreground font-black tracking-widest mb-0.5 text-center">Com.</p>
                      <p className="text-xs font-black text-emerald-600 text-center">+{formatCurrency(product.commission)}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <p className="text-[8px] uppercase text-muted-foreground font-black tracking-widest mb-0.5 text-center">Stock</p>
                      <p className={cn("text-xs font-black text-center", product.virtual_stock < 100 ? "text-red-600" : "text-foreground")}>
                        {product.virtual_stock}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 px-4 rounded-xl text-xs font-bold gap-2"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit size={14} /> Modifier
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-slate-100 dark:border-slate-800">
                          <MoreVertical size={16} className="text-slate-500" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-2xl">
                        {product.status === 'actif' ? (
                          <DropdownMenuItem className="rounded-xl h-11 gap-3 text-orange-600 focus:text-orange-600" onClick={() => {
                            setProductsList(productsList.map(p => p.id === product.id ? {...p, status: 'inactif'} : p));
                            toast.success("Produit désactivé")
                          }}>
                            Désactiver
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="rounded-xl h-11 gap-3 text-emerald-600 focus:text-emerald-600" onClick={() => {
                            setProductsList(productsList.map(p => p.id === product.id ? {...p, status: 'actif'} : p));
                            toast.success("Produit activé")
                          }}>
                            Activer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* MODAL DE MODIFICATION */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-950">
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 px-6 py-6 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white font-bold tracking-tight">Modifier le produit</DialogTitle>
                <DialogDescription className="text-slate-200/80">
                  Mettez à jour les informations du produit {editingProduct?.name}.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="px-6 py-6 grid gap-5 bg-white dark:bg-slate-950">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-prod-name" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Nom du produit</Label>
                  <Input id="edit-prod-name" defaultValue={editingProduct?.name} className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-500 transition-all shadow-sm text-foreground" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-prod-code" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Code</Label>
                    <Input id="edit-prod-code" defaultValue={editingProduct?.code} className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-500 transition-all shadow-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-prod-cat" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Catégorie</Label>
                    <Input id="edit-prod-cat" defaultValue={editingProduct?.category?.name} className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-500 transition-all shadow-sm text-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-prod-buy" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Prix Achat (DT)</Label>
                    <Input id="edit-prod-buy" type="number" defaultValue={editingProduct?.purchase_price} className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-500 transition-all shadow-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-prod-sell" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Prix Vente (DT)</Label>
                    <Input id="edit-prod-sell" type="number" defaultValue={editingProduct?.sale_price} className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-500 transition-all shadow-sm text-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-prod-img" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">URL de l&apos;image</Label>
                  <Input id="edit-prod-img" defaultValue={editingProduct?.image_url} className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-500 transition-all shadow-sm text-foreground" />
                </div>
              </div>
            </div>
            
            <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="h-10 bg-white dark:bg-slate-950">Annuler</Button>} />
              <Button type="button" className="bg-slate-800 hover:bg-slate-900 text-white font-medium shadow-lg px-6 h-10" onClick={async () => {
                const name = (document.getElementById('edit-prod-name') as HTMLInputElement).value;
                const code = (document.getElementById('edit-prod-code') as HTMLInputElement).value;
                const buy = Number((document.getElementById('edit-prod-buy') as HTMLInputElement).value);
                const sell = Number((document.getElementById('edit-prod-sell') as HTMLInputElement).value);
                
                try {
                  const updated = await productService.update(editingProduct.id, {
                    name: name,
                    code: code,
                    purchase_price: buy,
                    sale_price: sell,
                    commission: sell - buy,
                    image_url: (document.getElementById('edit-prod-img') as HTMLInputElement).value
                  });
                  
                  setProductsList(productsList.map(p => p.id === editingProduct.id ? { ...p, ...updated } : p));
                  setEditingProduct(null);
                  toast.success('Produit modifié avec succès !');
                } catch (error) {
                  toast.error('Erreur lors de la modification');
                }
              }}>
                Enregistrer les modifications
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
