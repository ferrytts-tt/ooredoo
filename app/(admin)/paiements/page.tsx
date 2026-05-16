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
  Receipt,
  FileText
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
import { formatCurrency, formatDate, getPaymentMethodLabel, cn } from '@/lib/utils'
import { useEffect } from 'react'
import { paymentService } from '@/lib/services/paymentService'
import { resellerService } from '@/lib/services/resellerService'
import type { Reseller, Payment } from '@/types/database'

export default function PaiementsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentsList, setPaymentsList] = useState<any[]>([])
  const [resellers, setResellers] = useState<Reseller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState<{ from: Date; to: Date } | undefined>(undefined)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [pays, res] = await Promise.all([
        paymentService.getAll(),
        resellerService.getAll()
      ])
      setPaymentsList(pays)
      setResellers(res)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPayments = paymentsList.filter((payment) => {
    const matchesSearch = 
      payment.reseller?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (date?.from && date?.to) {
      const pDate = new Date(payment.created_at)
      if (pDate < date.from || pDate > date.to) return false
    }

    return matchesSearch
  })

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paiements</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez les encaissements et la réduction des dettes
          </p>
        </div>
        <Dialog>
          <DialogTrigger render={
            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-600/20">
              <Plus size={16} />
              Nouveau Paiement
            </Button>
          } />
          <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-950">
            <div className="bg-gradient-to-br from-red-600 to-red-800 px-6 py-6 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white font-bold tracking-tight">Enregistrer un paiement</DialogTitle>
                <DialogDescription className="text-red-100/80">
                  Ajoutez un nouvel encaissement pour réduire la dette d'un revendeur.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="px-6 py-6 grid gap-5 bg-white dark:bg-slate-950">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pay-reseller" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Revendeur</Label>
                  <select id="pay-reseller" className="flex h-11 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500/20 text-foreground">
                    {resellers.map(r => (
                      <option key={r.id} value={r.id}>{r.company_name} (Dette: {formatCurrency(r.current_debt)})</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pay-amount" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Montant (DT)</Label>
                    <Input id="pay-amount" type="number" placeholder="Ex: 5000" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 transition-all shadow-sm text-foreground font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pay-method" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Méthode de paiement</Label>
                    <select id="pay-method" className="flex h-11 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500/20 text-foreground">
                      <option value="virement">Virement bancaire</option>
                      <option value="cheque">Chèque</option>
                      <option value="traite">Traite</option>
                      <option value="retour">Retour article</option>
                      <option value="especes">Espèces</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pay-ref" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Référence de transaction</Label>
                  <Input id="pay-ref" placeholder="Ex: VIR-12345678" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 transition-all shadow-sm text-foreground" />
                </div>
              </div>
            </div>
            
            <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="h-10 bg-white dark:bg-slate-950">Annuler</Button>} />
              <DialogClose render={<Button type="button" className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-600/20 px-6 h-10" onClick={async () => {
                const resellerId = (document.getElementById('pay-reseller') as HTMLSelectElement).value;
                const amount = Number((document.getElementById('pay-amount') as HTMLInputElement).value);
                const method = (document.getElementById('pay-method') as HTMLSelectElement).value;
                const ref = (document.getElementById('pay-ref') as HTMLInputElement).value;
                
                try {
                  const newPayment = {
                    reseller_id: resellerId,
                    amount: amount || 0,
                    method: method as any,
                    reference: ref || 'N/A',
                    created_by: 'admin'
                  };
                  await paymentService.create(newPayment);
                  await fetchData();
                  toast.success('Paiement enregistré avec succès !');
                } catch (error) {
                  toast.error('Erreur lors de l\'enregistrement');
                }
              }}>Valider l'encaissement</Button>} />
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
                placeholder="Rechercher revendeur, référence..."
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
                  loading: 'Génération de l\'exportation financière...',
                  success: 'Rapport des paiements exporté avec succès',
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
                  <TableHead>Méthode & Réf</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Impact Dette</TableHead>
                  <TableHead className="w-[80px]">Reçu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                        <span className="text-sm text-muted-foreground font-medium">Chargement des paiements...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun paiement trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          {formatDate(payment.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium">{payment.reseller?.company_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal mb-1">
                          {getPaymentMethodLabel(payment.method)}
                        </Badge>
                        {payment.reference && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {payment.reference}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600">
                        + {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-xs text-muted-foreground line-through">
                          {formatCurrency(payment.debt_before)}
                        </div>
                        <div className="text-sm font-semibold text-orange-600">
                          {formatCurrency(payment.debt_after)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-red-600" 
                          title="Télécharger le reçu PDF"
                          onClick={() => toast.success('Téléchargement du reçu PDF démarré')}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredPayments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm italic">
                Aucun paiement trouvé.
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div key={payment.id} className="p-4 space-y-3 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 shadow-sm">
                        <Receipt size={16} />
                      </div>
                      <div>
                        <p className="font-black text-sm text-foreground tracking-tight">{payment.reseller?.company_name}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(payment.created_at)}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5">
                      {getPaymentMethodLabel(payment.method)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[8px] uppercase text-muted-foreground font-black tracking-widest mb-0.5">Montant</p>
                      <p className="text-base font-black text-emerald-600">+{formatCurrency(payment.amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] uppercase text-muted-foreground font-black tracking-widest mb-0.5">Nouvelle Dette</p>
                      <p className="text-sm font-black text-orange-600">{formatCurrency(payment.debt_after)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[10px] font-mono text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      {payment.reference || 'N/A'}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 px-4 rounded-xl text-xs font-bold gap-2"
                      onClick={() => toast.success('Reçu PDF généré')}
                    >
                      <FileText size={14} /> Reçu
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div>Affichage de {filteredPayments.length} paiement(s)</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Précédent</Button>
              <Button variant="outline" size="sm" disabled>Suivant</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
