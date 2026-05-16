'use client'


import {
  Search,
  Plus,
  Filter,
  Download,
  Calendar as CalendarIcon,
  Clock,
  CreditCard,
  FileText,
  AlertCircle,
  Receipt
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { formatCurrency, formatDate, getPaymentMethodLabel, calcDebtPercentage, cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { resellerDashboardService } from '@/lib/services/resellerDashboardService'
import type { Payment } from '@/types/database'

export default function RevendeurPaiementsPage() {
  const { user: profile, reseller, setReseller } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentsList, setPaymentsList] = useState<any[]>([])
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
        const [pays, myStats] = await Promise.all([
          resellerDashboardService.getMyPayments(currentReseller.id),
          resellerDashboardService.getMyStats(currentReseller.id)
        ])
        setPaymentsList(pays)
        setStats(myStats)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPayments = paymentsList.filter((p) => {
    const matchesSearch = 
      p.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (date?.from && date?.to) {
      const pDate = new Date(p.created_at)
      if (pDate < date.from || pDate > date.to) return false
    }

    return matchesSearch
  })

  const debtPct = stats ? calcDebtPercentage(stats.current_debt, stats.credit_limit) : 0

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Paiements</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Historique de vos règlements et état de votre dette
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-600/20" onClick={() => toast.info('Veuillez contacter l\'administrateur pour soumettre une preuve de paiement')}>
          <Receipt size={16} />
          Signaler un paiement
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-0 shadow-sm bg-gradient-to-br from-slate-800 to-slate-900 text-white overflow-hidden relative">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Ma Dette Actuelle</CardDescription>
            <CardTitle className="text-3xl font-black">{formatCurrency(stats?.current_debt || 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Plafond: {formatCurrency(stats?.credit_limit || 0)}</span>
                  <span className={cn("font-bold", debtPct >= 90 ? "text-red-400" : "text-emerald-400")}>{debtPct}% utilisé</span>
                </div>
                <Progress value={debtPct} className="h-2 bg-slate-700 p-0 rounded-full border-0">
                  <ProgressTrack className="h-full bg-slate-700">
                    <ProgressIndicator className={cn("h-full transition-all", debtPct >= 90 ? "bg-red-500" : "bg-emerald-500")} />
                  </ProgressTrack>
                </Progress>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                <AlertCircle size={14} className="text-amber-500" />
                <span>Plus que {formatCurrency((stats?.credit_limit || 0) - (stats?.current_debt || 0))} de crédit</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-border">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par référence..."
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
                <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                  toast.promise(
                    new Promise((resolve) => setTimeout(resolve, 1500)),
                    {
                      loading: 'Génération du rapport financier...',
                      success: 'Rapport exporté avec succès !',
                      error: 'Erreur lors de l\'exportation',
                    }
                  )
                }}>
                  <Download size={14} />
                  Exporter
                </Button>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Réf</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
                        <span className="text-sm text-muted-foreground font-medium">Chargement des paiements...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Aucun paiement trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                    filteredPayments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="text-sm font-medium">{formatDate(p.created_at)}</div>
                          <div className="text-xs text-muted-foreground font-mono">{p.reference || p.id}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getPaymentMethodLabel(p.method)}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-600">
                          + {formatCurrency(p.amount)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => toast.success('Téléchargement du reçu...')}>
                            <FileText size={16} className="text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.map((p) => (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{formatDate(p.created_at)}</div>
                      <div className="font-bold text-foreground">{p.reference || 'Paiement'}</div>
                    </div>
                    <Badge variant="secondary" className="text-[9px] uppercase font-black">{getPaymentMethodLabel(p.method)}</Badge>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Montant versé</p>
                      <p className="text-lg font-black text-emerald-600">+{formatCurrency(p.amount)}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl h-8 text-[10px] font-bold px-3 gap-2">
                      <FileText size={12} /> Reçu
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
