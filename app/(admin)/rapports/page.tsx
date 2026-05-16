'use client'

import { useState } from 'react'
import {
  Download,
  Calendar as CalendarIcon,
  BarChart3,
  TrendingUp,
  CreditCard,
  FileSpreadsheet,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockStats, mockResellers, mockProducts, mockTransactions, mockPayments } from '@/lib/data/mockData'
import { formatCurrency, cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export default function RapportsPage() {
  const [period, setPeriod] = useState('this_month')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [includeTotals, setIncludeTotals] = useState(true)
  const [groupByCategory, setGroupByCategory] = useState(false)
  const [comparePrev, setComparePrev] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['Date', 'Produit', 'Quantité', 'Total TTC', 'Revendeur'])

  // Simulation de données changeantes selon la période
  const getStats = () => {
    const base = mockStats.today_revenue * 14
    switch(period) {
      case 'today': return { sales: base / 14, collected: 12000, debt: mockStats.total_debt }
      case 'trimestre': return { sales: base * 3, collected: base * 2.8, debt: mockStats.total_debt + 45000 }
      case 'year': return { sales: base * 12, collected: base * 11.5, debt: mockStats.total_debt + 120000 }
      default: return { sales: base, collected: 145000, debt: mockStats.total_debt }
    }
  }

  const currentStats = getStats()

  const periodLabels: Record<string, string> = {
    'today': "Aujourd'hui",
    'this_month': 'Ce mois',
    'trimestre': 'Ce trimestre',
    'year': 'Cette année'
  }

  const toggleColumn = (col: string) => {
    setSelectedColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    )
  }

  const generateCsvContent = (reportType: string) => {
    let headers: string[] = []
    let rows: any[] = []

    switch (reportType) {
      case 'ventes':
        headers = ['ID', 'Date', 'Produit', 'Quantité', 'Prix Unitaire', 'Total', 'Revendeur']
        rows = mockTransactions.map(t => [
          t.id, 
          new Date(t.created_at).toLocaleDateString(), 
          t.product?.name, 
          t.quantity, 
          t.unit_price, 
          t.total_amount, 
          t.reseller?.company_name
        ])
        break
      case 'activite':
        headers = ['ID', 'Société', 'Gérant', 'Ville', 'Statut', 'Plafond', 'Dette Actuelle']
        rows = mockResellers.map(r => [
          r.id, 
          r.company_name, 
          r.manager_name, 
          r.city, 
          r.status, 
          r.credit_limit, 
          r.current_debt
        ])
        break
      case 'paiements':
        headers = ['ID', 'Date', 'Revendeur', 'Montant', 'Méthode', 'Référence']
        rows = mockPayments.map(p => [
          p.id, 
          new Date(p.created_at).toLocaleDateString(), 
          p.reseller?.company_name, 
          p.amount, 
          p.method, 
          p.reference || 'N/A'
        ])
        break
      case 'dette':
        headers = ['Revendeur', 'Plafond', 'Dette', 'Utilisation (%)']
        rows = mockResellers.map(r => [
          r.company_name, 
          r.credit_limit, 
          r.current_debt, 
          Math.round((r.current_debt / r.credit_limit) * 100)
        ])
        break
      default:
        headers = ['Rapport', 'Date de génération']
        rows = [[reportType, new Date().toLocaleString()]]
    }

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n')

    return "\uFEFF" + csvContent // BOM for Excel UTF-8 support
  }

  const handleExport = (type: 'csv' | 'pdf', title: string) => {
    const reportKey = selectedReport || title.toLowerCase().split(' ')[0]
    
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          const content = generateCsvContent(reportKey)
          const element = document.createElement("a");
          const file = new Blob([content], { type: 'text/csv;charset=utf-8;' });
          element.href = URL.createObjectURL(file);
          element.download = `ooredoo_rapport_${reportKey}_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
          resolve(true);
        }, 1500);
      }),
      {
        loading: `Génération du rapport ${type.toUpperCase()}...`,
        success: `Rapport "${title}" téléchargé avec succès !`,
        error: "Erreur lors de la génération du rapport.",
      }
    )
  }

  const renderReportGenerator = () => {
    const reportTitles: Record<string, string> = {
      'ventes': 'Ventes par produit',
      'activite': 'Activité revendeurs',
      'paiements': 'Historique des paiements',
      'dette': 'Évolution de la dette'
    }

    return (
      <div className="space-y-6 animate-in">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)} className="h-8 w-8 p-0">
            ←
          </Button>
          <h3 className="text-lg font-bold text-foreground">{reportTitles[selectedReport!] || 'Générateur de rapport'}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Configuration du rapport</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-sm">Inclure les totaux</span>
                <Switch checked={includeTotals} onCheckedChange={setIncludeTotals} />
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-sm">Grouper par catégorie</span>
                <Switch checked={groupByCategory} onCheckedChange={setGroupByCategory} />
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-sm">Comparer à N-1</span>
                <Switch checked={comparePrev} onCheckedChange={setComparePrev} />
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Colonnes à exporter</h4>
            <div className="flex flex-wrap gap-2">
              {['Date', 'Produit', 'Quantité', 'Montant HT', 'TVA', 'Total TTC', 'Revendeur', 'Région'].map(col => (
                <Badge 
                  key={col} 
                  variant={selectedColumns.includes(col) ? "default" : "secondary"}
                  className={cn(
                    "px-3 py-1 cursor-pointer transition-all",
                    selectedColumns.includes(col) 
                      ? "bg-red-600 hover:bg-red-700 text-white border-transparent" 
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-foreground hover:border-red-500"
                  )}
                  onClick={() => toggleColumn(col)}
                >
                  {col}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={() => setSelectedReport(null)}>Annuler</Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white gap-2"
            onClick={() => handleExport('csv', reportTitles[selectedReport!] || 'Rapport')}
          >
            <Download size={16} />
            Générer et Exporter
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rapports & Exports</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Générez des rapports détaillés sur les ventes et l&apos;état des crédits
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" className="gap-2 min-w-[160px] justify-between">
                <span className="flex items-center gap-2">
                  <CalendarIcon size={16} />
                  Période: {periodLabels[period]}
                </span>
                <span className="text-[10px] opacity-50">▼</span>
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => setPeriod('today')}>Aujourd&apos;hui</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod('this_month')}>Ce mois</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod('trimestre')}>Ce trimestre</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod('year')}>Cette année</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">Total Ventes Période</p>
                <p className="text-xl font-bold">{formatCurrency(currentStats.sales)}</p>
              </div>
            </div>
            <Button 
              className="w-full bg-white/10 hover:bg-white/20 border-0 text-white gap-2 h-9"
              onClick={() => handleExport('csv', 'Ventes Période')}
            >
              <FileSpreadsheet size={14} /> Exporter CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <CreditCard size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-100">Total Encaissements</p>
                <p className="text-xl font-bold">{formatCurrency(currentStats.collected)}</p>
              </div>
            </div>
            <Button 
              className="w-full bg-white/20 hover:bg-white/30 border-0 text-white gap-2 h-9"
              onClick={() => handleExport('csv', 'Encaissements')}
            >
              <FileSpreadsheet size={14} /> Exporter CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-100">Dette Globale</p>
                <p className="text-xl font-bold">{formatCurrency(currentStats.debt)}</p>
              </div>
            </div>
            <Button 
              className="w-full bg-white/20 hover:bg-white/30 border-0 text-white gap-2 h-9"
              onClick={() => handleExport('csv', 'Dette Globale')}
            >
              <FileSpreadsheet size={14} /> Exporter CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-100">Rapport Complet</p>
                <p className="text-xl font-bold">PDF consolidé</p>
              </div>
            </div>
            <Button 
              className="w-full bg-white/20 hover:bg-white/30 border-0 text-white gap-2 h-9"
              onClick={() => handleExport('pdf', 'Rapport Complet')}
            >
              <Download size={14} /> Télécharger PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Générateur de Rapports Personnalisés</CardTitle>
          <CardDescription>
            Configurez les colonnes et les filtres pour générer un rapport sur mesure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedReport ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border animate-in">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">Sélectionnez le type de rapport</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Choisissez les données que vous souhaitez analyser. Vous pourrez ensuite appliquer des filtres avancés avant l&apos;export.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={() => setSelectedReport('ventes')} className="hover:border-red-500 hover:text-red-600 transition-colors">Ventes par produit</Button>
                <Button variant="outline" onClick={() => setSelectedReport('activite')} className="hover:border-red-500 hover:text-red-600 transition-colors">Activité revendeurs</Button>
                <Button variant="outline" onClick={() => setSelectedReport('paiements')} className="hover:border-red-500 hover:text-red-600 transition-colors">Historique des paiements</Button>
                <Button variant="outline" onClick={() => setSelectedReport('dette')} className="hover:border-red-500 hover:text-red-600 transition-colors">Évolution de la dette</Button>
              </div>
            </div>
          ) : (
            renderReportGenerator()
          )}
        </CardContent>
      </Card>
    </div>
  )
}
