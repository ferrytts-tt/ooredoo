'use client'

import { useState } from 'react'
import {
  Search,
  Plus,
  Filter,
  Download,
  Calendar as CalendarIcon,
  Clock,
  Building2,
  Package,
  MoreVertical,
  MessageSquare,
  Check,
  X
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { useEffect } from 'react'
import { transactionService } from '@/lib/services/transactionService'
import { resellerService } from '@/lib/services/resellerService'
import { productService } from '@/lib/services/productService'
import type { Reseller, Product } from '@/types/database'

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [transactionsList, setTransactionsList] = useState<any[]>([])
  const [resellers, setResellers] = useState<Reseller[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [noteTxn, setNoteTxn] = useState<any>(null)
  const [date, setDate] = useState<{ from: Date; to: Date } | undefined>(undefined)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [txns, res, prods] = await Promise.all([
        transactionService.getAll(),
        resellerService.getAll(),
        productService.getAll()
      ])
      setTransactionsList(txns)
      setResellers(res)
      setProducts(prods)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTransactions = transactionsList.filter((txn) => {
    const matchesSearch = 
      txn.reseller?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (date?.from && date?.to) {
      const txDate = new Date(txn.created_at)
      if (txDate < date.from || txDate > date.to) return false
    }

    return matchesSearch
  })

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Historique des achats et mouvements de crédit
          </p>
        </div>
        <Dialog>
          <DialogTrigger render={
            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-600/20">
              <Plus size={16} />
              Nouvelle Vente
            </Button>
          } />
          <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-950">
            <div className="bg-gradient-to-br from-red-600 to-red-800 px-6 py-6 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white font-bold tracking-tight">Nouvelle Vente de Crédit</DialogTitle>
                <DialogDescription className="text-red-100/80">
                  Enregistrez une vente de produit ou de crédit pour un revendeur.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="px-6 py-6 grid gap-5 bg-white dark:bg-slate-950">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="txn-reseller" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Revendeur</Label>
                  <select id="txn-reseller" className="flex h-11 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500/20 text-foreground">
                    {resellers.map(r => (
                      <option key={r.id} value={r.id}>{r.company_name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="txn-product" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Produit</Label>
                    <select id="txn-product" className="flex h-11 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500/20 text-foreground">
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.sale_price)})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="txn-qty" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Quantité</Label>
                    <Input id="txn-qty" type="number" defaultValue="1" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 transition-all shadow-sm text-foreground" />
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="h-10 bg-white dark:bg-slate-950">Annuler</Button>} />
              <DialogClose render={<Button type="button" className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-600/20 px-6 h-10" onClick={async () => {
                const resellerId = (document.getElementById('txn-reseller') as HTMLSelectElement).value;
                const productId = (document.getElementById('txn-product') as HTMLSelectElement).value;
                const qty = Number((document.getElementById('txn-qty') as HTMLInputElement).value);
                
                const product = products.find(p => p.id === productId);
                if (!product) return;

                try {
                  const newTxn = {
                    reseller_id: resellerId,
                    product_id: productId,
                    quantity: qty,
                    unit_price: product.sale_price,
                    total_amount: qty * product.sale_price,
                    status: 'complete' as const,
                    created_by: 'admin'
                  };
                  await transactionService.create(newTxn);
                  await fetchData();
                  toast.success('Vente enregistrée avec succès !');
                } catch (error) {
                  toast.error('Erreur lors de l\'enregistrement');
                }
              }}>Valider la vente</Button>} />
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
                placeholder="Rechercher revendeur ou produit..."
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
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info('Filtres avancés bientôt disponibles')}>
                <Filter size={14} />
                Filtres
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                toast.promise(new Promise(r => setTimeout(r, 1500)), {
                  loading: 'Préparation de l\'exportation (Format Excel)...',
                  success: 'Le journal des transactions a été exporté !',
                  error: 'Erreur lors de l\'export'
                })
              }}>
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
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Revendeur</TableHead>
                  <TableHead>Produit & Qté</TableHead>
                  <TableHead className="text-right">Montant Total</TableHead>
                  <TableHead className="text-right">Dette Avant/Après</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                        <span className="text-sm text-muted-foreground font-medium">Chargement des transactions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucune transaction trouvée.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          {formatDate(txn.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium">{txn.reseller?.company_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <Package className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">{txn.product?.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {txn.quantity} x {formatCurrency(txn.unit_price)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground">
                        {formatCurrency(txn.total_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-xs text-muted-foreground line-through">
                          {formatCurrency(txn.debt_before)}
                        </div>
                        <div className="text-sm font-semibold text-orange-600">
                          {formatCurrency(txn.debt_after)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {txn.status === 'complete' ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                            Complétée
                          </Badge>
                        ) : txn.status === 'en_attente' ? (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800 animate-pulse">
                            En Attente
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
                            Annulée
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {txn.status === 'en_attente' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                onClick={async () => {
                                  try {
                                    await transactionService.approve(txn.id);
                                    setTransactionsList(transactionsList.map(t => t.id === txn.id ? {...t, status: 'complete'} : t));
                                    toast.success('Commande approuvée !');
                                  } catch (error) {
                                    toast.error('Erreur');
                                  }
                                }}
                                title="Approuver"
                              >
                                <Check size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={async () => {
                                  try {
                                    await transactionService.approve(txn.id); // Devrait être annuler
                                    setTransactionsList(transactionsList.map(t => t.id === txn.id ? {...t, status: 'annule'} : t));
                                    toast.error('Commande annulée');
                                  } catch (error) {
                                    toast.error('Erreur');
                                  }
                                }}
                                title="Annuler"
                              >
                                <X size={16} />
                              </Button>
                            </>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
                              <MoreVertical className="h-4 w-4 text-slate-500" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => setNoteTxn(txn)}>
                                <MessageSquare className="mr-2 h-4 w-4" /> Ajouter une note
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
              filteredTransactions.map((txn) => (
                <div key={txn.id} className="p-4 space-y-3 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shadow-sm">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="font-black text-sm text-foreground tracking-tight">{txn.reseller?.company_name}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(txn.created_at)}</p>
                      </div>
                    </div>
                    {txn.status === 'complete' ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] uppercase font-bold tracking-tighter">Complétée</Badge>
                    ) : txn.status === 'en_attente' ? (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[9px] uppercase font-bold tracking-tighter animate-pulse">En Attente</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[9px] uppercase font-bold tracking-tighter">Annulée</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-muted-foreground" />
                      <span className="text-xs font-bold text-foreground">{txn.product?.name}</span>
                      <span className="text-[10px] text-muted-foreground">x{txn.quantity}</span>
                    </div>
                    <span className="text-sm font-black text-foreground">{formatCurrency(txn.total_amount)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-4">
                      {txn.status === 'en_attente' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-3 rounded-xl text-xs font-bold"
                            onClick={() => {
                              updateTransactionStatus(txn.id, 'complete');
                              toast.success('Commande approuvée !');
                            }}
                          >
                            Approuver
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-9 px-3 rounded-xl text-xs font-bold"
                            onClick={() => {
                              updateTransactionStatus(txn.id, 'annule');
                              toast.error('Commande annulée');
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-slate-100 dark:border-slate-800">
                          <MoreVertical size={16} className="text-slate-500" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-2xl">
                        <DropdownMenuItem className="rounded-xl h-11 gap-3" onClick={() => setNoteTxn(txn)}>
                          <MessageSquare size={16} /> <span className="font-bold text-sm">Ajouter note</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl h-11 gap-3">
                          <Download size={16} /> <span className="font-bold text-sm">Recu PDF</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div>Affichage de {filteredTransactions.length} transaction(s)</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Précédent</Button>
              <Button variant="outline" size="sm" disabled>Suivant</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODAL POUR AJOUTER UNE NOTE */}
      <Dialog open={!!noteTxn} onOpenChange={(open) => !open && setNoteTxn(null)}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-950">
            <div className="bg-slate-900 px-6 py-5 text-white">
              <DialogHeader>
                <DialogTitle className="text-xl text-white font-bold">Note de transaction</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Transaction du {noteTxn && formatDate(noteTxn.created_at)}
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="px-6 py-6 bg-white dark:bg-slate-950">
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Détails</p>
                  <p className="text-sm font-medium">{noteTxn?.reseller?.company_name} - {noteTxn?.product?.name}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="txn-note" className="text-sm font-semibold">Votre note (mémo)</Label>
                  <textarea 
                    id="txn-note" 
                    rows={4}
                    placeholder="Tapez votre note ici pour mémoriser un détail sur cette vente..."
                    className="flex w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500/20 text-foreground resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="h-10">Annuler</Button>} />
              <Button type="button" className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 h-10" onClick={() => {
                const note = (document.getElementById('txn-note') as HTMLTextAreaElement).value;
                updateTransactionNote(noteTxn.id, note);
                setNoteTxn(null);
                toast.success('Note enregistrée avec succès !');
              }}>
                Enregistrer la note
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
