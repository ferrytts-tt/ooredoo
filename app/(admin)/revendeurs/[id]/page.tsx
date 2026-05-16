'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  Ban,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { mockResellers, mockTransactions, mockPayments } from '@/lib/data/mockData'
import { formatCurrency, formatDate, calcDebtPercentage, getStatusBadge, getPaymentMethodLabel } from '@/lib/utils'

export default function RevendeurDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  // Mock fetch
  const reseller = mockResellers.find(r => r.id === id)
  const transactions = mockTransactions.filter(t => t.reseller_id === id)
  const payments = mockPayments.filter(p => p.reseller_id === id)

  if (!reseller) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-xl font-bold mb-4">Revendeur introuvable</h2>
        <Button onClick={() => router.push('/revendeurs')}>Retour à la liste</Button>
      </div>
    )
  }

  const statusBadge = getStatusBadge(reseller.status)
  const debtPct = calcDebtPercentage(reseller.current_debt, reseller.credit_limit)

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/revendeurs')}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{reseller.company_name}</h1>
              <Badge variant={statusBadge.variant} className="capitalize">{statusBadge.label}</Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Responsable: {reseller.manager_name} (CIN: {reseller.cin})
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <CreditCard size={16} />
            Ajuster Plafond
          </Button>
          {reseller.status === 'actif' ? (
            <Button variant="destructive" className="gap-2">
              <Ban size={16} />
              Bloquer
            </Button>
          ) : (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <CheckCircle size={16} />
              Réactiver
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Infos */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">{reseller.company_name}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">Créé le {formatDate(reseller.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{reseller.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{reseller.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-foreground">{reseller.address}, {reseller.city}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Financials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Credit Overview */}
          <Card className="border-0 shadow-sm overflow-hidden relative">
            {debtPct >= 90 && (
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
            )}
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Plafond de crédit</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(reseller.credit_limit)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Dette actuelle</p>
                  <p className={`text-2xl font-bold ${
                    debtPct >= 90 ? 'text-red-600' : debtPct >= 70 ? 'text-orange-600' : 'text-foreground'
                  }`}>
                    {formatCurrency(reseller.current_debt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Crédit disponible</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(reseller.available_credit)}</p>
                </div>
              </div>

              <div className="mt-8">
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

          {/* History Tabs */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Tabs defaultValue="transactions" className="w-full">
                <div className="px-6 pt-4 border-b border-border">
                  <TabsList className="bg-transparent h-auto p-0 gap-6">
                    <TabsTrigger 
                      value="transactions"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none pb-3 px-0 font-medium"
                    >
                      Dernières Transactions
                    </TabsTrigger>
                    <TabsTrigger 
                      value="paiements"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none pb-3 px-0 font-medium"
                    >
                      Historique Paiements
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="transactions" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead className="text-right">Dette après</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            Aucune transaction
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((txn) => (
                          <TableRow key={txn.id}>
                            <TableCell className="text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                {formatDate(txn.created_at)}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {txn.product?.name || txn.product_id}
                              <div className="text-xs text-muted-foreground font-normal">
                                {txn.quantity} unités
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-foreground">
                              {formatCurrency(txn.total_amount)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                              {formatCurrency(txn.debt_after)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="paiements" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Méthode</TableHead>
                        <TableHead className="text-right">Montant Payé</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            Aucun paiement
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                {formatDate(payment.created_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-normal">
                                {getPaymentMethodLabel(payment.method)}
                              </Badge>
                              {payment.reference && (
                                <div className="text-xs text-muted-foreground mt-1">Ref: {payment.reference}</div>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-bold text-emerald-600">
                              + {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" title="Télécharger reçu">
                                <Receipt className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
