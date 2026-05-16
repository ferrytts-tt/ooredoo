'use client'

import { useState } from 'react'
import {
  TrendingUp,
  Users,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  ShoppingCart,
  Ban,
  Clock,
  ArrowRight,
  PackageCheck,
  Building2,
  Bell,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { mockStats, mockSalesData, mockTopResellers, mockNotifications, mockRegionData, mockTransactions } from '@/lib/data/mockData'
import { formatCurrency, formatDate, calcDebtPercentage } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { dashboardService } from '@/lib/services/dashboardService'
import type { DashboardStats } from '@/types/database'

// KPI Card Component
function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'red',
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  trend?: 'up' | 'down'
  trendValue?: string
  color?: 'red' | 'blue' | 'green' | 'orange'
}) {
  const colorMap = {
    red: 'from-red-500 to-red-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
  }

  return (
    <Card className="card-hover border-0 shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trendValue && (
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trendValue} ce mois
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Custom tooltip for charts
interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-lg p-3">
        <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingTxns, setPendingTxns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [statsData, txnsData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getPendingTransactions()
        ])
        setStats(statsData)
        setPendingTxns(txnsData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Erreur lors du chargement des données')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Use mock data if real data is still loading or unavailable
  const currentStats = stats || mockStats
  const currentPendingTxns = pendingTxns.length > 0 ? pendingTxns : mockTransactions.filter(t => t.status === 'en_attente')
  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Vue d&apos;ensemble de votre activité commerciale
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent/50 px-4 py-2 rounded-xl">
          <Activity size={14} className="text-red-600" />
          <span>Mis à jour il y a 2 min</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Crédits Accordés"
          value={formatCurrency(currentStats.total_credit_granted)}
          subtitle={`${currentStats.total_resellers} revendeurs actifs`}
          icon={TrendingUp}
          trend="up"
          trendValue="+12%"
          color="red"
        />
        <KpiCard
          title="Total Dettes"
          value={formatCurrency(currentStats.total_debt)}
          subtitle={`${currentStats.debt_alert_count} alertes en cours`}
          icon={CreditCard}
          trend="up"
          trendValue="+3.2%"
          color="orange"
        />
        <KpiCard
          title="Revenus du Jour"
          value={formatCurrency(currentStats.today_revenue)}
          subtitle={`${currentStats.monthly_transactions} transactions/mois`}
          icon={DollarSign}
          trend="up"
          trendValue="+8.5%"
          color="green"
        />
        <KpiCard
          title="Revendeurs"
          value={`${currentStats.total_resellers}`}
          subtitle={`${currentStats.blocked_resellers} bloqué(s)`}
          icon={Users}
          trend="up"
          trendValue="+2 nouveaux"
          color="blue"
        />
      </div>

      {/* Alerts */}
      {currentStats.debt_alert_count > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-400">
                  {currentStats.debt_alert_count} revendeurs avec une dette élevée
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                  Ces revendeurs ont dépassé le seuil d&apos;alerte de leur plafond de crédit.{' '}
                  <Link href="/revendeurs" className="underline font-medium">
                    Voir tous →
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Ventes & Paiements</CardTitle>
                <CardDescription>Évolution sur les 14 derniers jours</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">14 jours</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={mockSalesData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="paymentsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                  formatter={(value) => value === 'sales' ? 'Ventes' : 'Paiements'}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#dc2626"
                  strokeWidth={2}
                  fill="url(#salesGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#dc2626' }}
                />
                <Area
                  type="monotone"
                  dataKey="payments"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#paymentsGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <div className="space-y-4">
          {/* Debt overview */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Répartition Revendeurs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Actifs</span>
                  <span className="font-medium text-emerald-600">{mockStats.active_resellers}</span>
                </div>
                <Progress
                  value={(mockStats.active_resellers / mockStats.total_resellers) * 100}
                  className="h-2 bg-muted [&>div]:bg-emerald-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Bloqués</span>
                  <span className="font-medium text-red-600">{mockStats.blocked_resellers}</span>
                </div>
                <Progress
                  value={(mockStats.blocked_resellers / mockStats.total_resellers) * 100}
                  className="h-2 bg-muted [&>div]:bg-red-500"
                />
              </div>
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Taux crédit utilisé</span>
                  <span className="text-xs font-bold text-orange-600">
                    {Math.round((mockStats.total_debt / mockStats.total_credit_granted) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(mockStats.total_debt / mockStats.total_credit_granted) * 100}
                  className="h-2 mt-1 bg-muted [&>div]:bg-orange-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent notifications */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Alertes récentes</CardTitle>
                <Link href="/notifications">
                  <Badge variant="destructive" className="text-[10px] cursor-pointer hover:opacity-80">
                    {mockNotifications.filter((n: any) => !n.is_read).length} nouvelles
                  </Badge>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockNotifications.slice(0, 3).map((notif: any) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                    !notif.is_read ? 'bg-red-50 dark:bg-red-950/20' : 'bg-muted/30'
                  }`}
                >
                  <AlertTriangle size={12} className={notif.type === 'plafond_depasse' ? 'text-red-500 mt-0.5 flex-shrink-0' : 'text-orange-500 mt-0.5 flex-shrink-0'} />
                  <div>
                    <p className="font-medium text-foreground">{notif.title}</p>
                    <p className="text-muted-foreground text-[10px] mt-0.5 line-clamp-1">{notif.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CA par Région */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Chiffre d&apos;Affaires par Région</CardTitle>
                <CardDescription>Performance géographique des ventes</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">Par région</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={mockRegionData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  dataKey="region" 
                  type="category" 
                  tick={{ fontSize: 12, fontWeight: 500, fill: 'hsl(var(--foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent)/0.5)' }} />
                <Bar 
                  dataKey="revenue" 
                  name="Revenus" 
                  fill="#dc2626" 
                  radius={[0, 4, 4, 0]} 
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-600 to-red-700 text-white flex flex-col justify-center p-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Region Leader: Tunis</h3>
              <p className="text-red-100 text-sm">Tunis représente 32% du chiffre d&apos;affaires total ce mois-ci, avec une croissance de +15%.</p>
            </div>
            <Button className="w-full bg-white text-red-600 hover:bg-red-50 font-semibold">
              Détails par région
            </Button>
          </div>
        </Card>
      </div>

      {/* Top Resellers Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Top Revendeurs</CardTitle>
              <CardDescription>Classés par volume d&apos;achats</CardDescription>
            </div>
            <Link href="/revendeurs">
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                Voir tous →
              </Badge>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTopResellers.map((reseller: any, index: number) => {
              const debtPct = calcDebtPercentage(reseller.current_debt, 20000)
              return (
                <div
                  key={reseller.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors"
                >
                  {/* Rank */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-slate-400 text-white' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {reseller.company_name}
                      </p>
                      {reseller.status === 'bloque' && (
                        <Ban size={12} className="text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Achats: {formatCurrency(reseller.total_purchases)}
                    </p>
                  </div>

                  {/* Debt */}
                  <div className="text-right hidden sm:block">
                    <p className={`text-xs font-semibold ${
                      debtPct >= 90 ? 'text-red-600' :
                      debtPct >= 70 ? 'text-orange-600' :
                      'text-foreground'
                    }`}>
                      {formatCurrency(reseller.current_debt)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">dette actuelle</p>
                  </div>

                  {/* Debt bar */}
                  <div className="w-24 hidden md:block">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Crédit</span>
                      <span className={debtPct >= 80 ? 'text-red-600 font-medium' : ''}>{debtPct}%</span>
                    </div>
                    <Progress
                      value={debtPct}
                      className={`h-1.5 bg-muted ${
                        debtPct >= 90 ? '[&>div]:bg-red-500' :
                        debtPct >= 70 ? '[&>div]:bg-orange-500' :
                        '[&>div]:bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
        {/* Pending Orders Alert */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card className="lg:col-span-2 border-0 shadow-xl shadow-red-600/5 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <PackageCheck size={20} />
                <h3 className="font-bold">Commandes en attente d&apos;approbation</h3>
              </div>
              <Badge className="bg-white/20 text-white border-0">3 nouvelles</Badge>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentPendingTxns.map((txn) => (
                  <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{txn.resellers?.company_name || txn.reseller?.company_name}</p>
                        <p className="text-xs text-muted-foreground">{txn.products?.name || txn.product?.name} x {txn.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div>
                        <p className="text-sm font-black text-foreground">{formatCurrency(txn.total_amount)}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(txn.created_at)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs"
                          onClick={() => toast.success("Commande approuvée")}
                        >
                          Approuver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 px-3 text-xs border-slate-200 dark:border-slate-700"
                          onClick={() => toast.error("Commande refusée")}
                        >
                          Refuser
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link href="/transactions" className="text-xs font-bold text-red-600 hover:underline flex items-center justify-center gap-1">
                  Voir toutes les transactions <ArrowRight size={12} />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Alertes Temps Réel</CardTitle>
                <Badge variant="secondary" className="animate-pulse bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Live</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 shrink-0">
                  <Bell size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-orange-800 dark:text-orange-300">Nouvelle Commande !</p>
                  <p className="text-[10px] text-orange-700 dark:text-orange-400 mt-1">Telecom Plus Tunis vient de commander 50x Recharge 10 TND.</p>
                  <p className="text-[9px] text-orange-500 mt-2 font-mono">Il y a 2 minutes</p>
                </div>
              </div>
              
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 shrink-0">
                  <CreditCard size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Paiement Reçu</p>
                  <p className="text-[10px] text-blue-700 dark:text-blue-400 mt-1">Sfax Mobile Distribution a versé 2,500 DT via Virement.</p>
                  <p className="text-[9px] text-blue-500 mt-2 font-mono">Il y a 45 minutes</p>
                </div>
              </div>

              <Button variant="outline" className="w-full text-xs h-9 border-slate-200">
                Ouvrir le centre de notifications
              </Button>
            </CardContent>
          </Card>
        </div>
      </Card>
    </div>
  )
}
