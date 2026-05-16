'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Ban,
  Eye,
  Filter,
  Download,
  AlertCircle,
  Key,
  ShieldCheck
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

import { formatCurrency, calcDebtPercentage, getStatusBadge, getDebtColor, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { resellerService } from '@/lib/services/resellerService'

export default function RevendeursPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [resellersList, setResellersList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingReseller, setEditingReseller] = useState<any>(null)
  const [changingPasswordReseller, setChangingPasswordReseller] = useState<any>(null)

  useEffect(() => {
    fetchResellers()
  }, [])

  const fetchResellers = async () => {
    try {
      setIsLoading(true)
      const data = await resellerService.getAll()
      setResellersList(data)
    } catch (error) {
      console.error('Error fetching resellers:', error)
      toast.error('Erreur lors du chargement des revendeurs')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredResellers = resellersList.filter((reseller) => {
    const matchesSearch =
      reseller.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reseller.manager_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reseller.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || reseller.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleAddReseller = async () => {
    const nameInput = document.getElementById('name') as HTMLInputElement
    const managerInput = document.getElementById('manager') as HTMLInputElement
    const phoneInput = document.getElementById('phone') as HTMLInputElement
    const regionInput = document.getElementById('region') as HTMLInputElement
    const limitInput = document.getElementById('limit') as HTMLInputElement
    const emailInput = document.getElementById('email') as HTMLInputElement
    const passwordInput = document.getElementById('password') as HTMLInputElement
    
    try {
      const payload = {
        company_name: nameInput?.value || '',
        manager_name: managerInput?.value || '',
        phone: phoneInput?.value || '',
        city: regionInput?.value || '',
        credit_limit: limitInput?.value ? Number(limitInput.value) : 5000,
        email: emailInput?.value || '',
        password: passwordInput?.value || 'Rev@2024!', // Default if empty
      }

      const response = await fetch('/api/admin/create-reseller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      
      if (!result.success) throw new Error(result.error)

      await fetchResellers()
      toast.success('Compte revendeur créé avec succès !')
    } catch (error: any) {
      console.error('Error adding reseller:', error)
      toast.error(error.message || 'Erreur lors de la création du compte')
    }
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revendeurs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez vos distributeurs et leurs plafonds de crédit
          </p>
        </div>
        <Dialog>
          <DialogTrigger render={
            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
              <Plus size={16} />
              Nouveau revendeur
            </Button>
          } />
          <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-950">
            <div className="bg-gradient-to-br from-red-600 to-red-800 px-6 py-6 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white font-bold tracking-tight">Ajouter un distributeur</DialogTitle>
                <DialogDescription className="text-red-100/80">
                  Créez un nouveau compte revendeur et définissez son plafond de crédit initial.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="px-6 py-6 grid gap-5 bg-white dark:bg-slate-950">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
                    Nom de la société
                  </Label>
                  <Input id="name" placeholder="Ex: Telecom Plus Tunis" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 focus:ring-red-500/20 transition-all shadow-sm text-foreground" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="matricule" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
                      Matricule Fiscal
                    </Label>
                    <Input id="matricule" placeholder="Ex: 1234567X/A/M/000" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 focus:ring-red-500/20 transition-all shadow-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
                      Région
                    </Label>
                    <Input id="region" placeholder="Ex: Sfax, Tunis..." className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 focus:ring-red-500/20 transition-all shadow-sm text-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manager" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
                      Gérant
                    </Label>
                    <Input id="manager" placeholder="Nom et prénom" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 focus:ring-red-500/20 transition-all shadow-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
                      Téléphone
                    </Label>
                    <Input id="phone" placeholder="+216 XX XXX XXX" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 focus:ring-red-500/20 transition-all shadow-sm text-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limit" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
                    Plafond de crédit (DT)
                  </Label>
                  <div className="relative">
                    <Input id="limit" type="number" defaultValue="5000" className="h-11 pl-4 pr-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 focus:ring-red-500/20 font-semibold text-lg transition-all shadow-sm text-foreground" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      DT
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
                      Identifiant / Email
                    </Label>
                    <Input id="email" type="email" placeholder="revendeur@ooredoo.tn" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 transition-all shadow-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
                      Mot de passe
                    </Label>
                    <Input id="password" type="password" placeholder="••••••••" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-red-500 transition-all shadow-sm text-foreground" />
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="h-10 bg-white dark:bg-slate-950">Annuler</Button>} />
              <DialogClose render={<Button type="button" className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-600/20 px-6 h-10" onClick={handleAddReseller}>Créer le compte</Button>} />
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
                placeholder="Rechercher par nom, tél..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info('Filtres ouverts')}>
                <Filter size={14} />
                Filtres
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                toast.promise(new Promise(r => setTimeout(r, 1000)), {
                  loading: 'Exportation de la liste...',
                  success: 'Liste des revendeurs exportée',
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
                  <TableHead>Revendeur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Plafond</TableHead>
                  <TableHead className="text-right">Dette</TableHead>
                  <TableHead className="text-right">Utilisation</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                        <span className="text-sm text-muted-foreground font-medium">Chargement des revendeurs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredResellers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun revendeur trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResellers.map((reseller) => {
                    const statusBadge = getStatusBadge(reseller.status)
                    const debtPct = calcDebtPercentage(reseller.current_debt, reseller.credit_limit)
                    const debtColor = getDebtColor(debtPct)

                    return (
                      <TableRow key={reseller.id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{reseller.company_name}</div>
                          <div className="text-xs text-muted-foreground">{reseller.city}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{reseller.manager_name}</div>
                          <div className="text-xs text-muted-foreground">{reseller.phone}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadge.variant} className="capitalize">
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(reseller.credit_limit)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(reseller.current_debt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={`flex items-center justify-end gap-2 text-sm font-semibold ${debtColor}`}>
                            {debtPct >= 90 && <AlertCircle size={14} />}
                            {debtPct}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
                              <MoreVertical className="h-5 w-5 text-slate-500" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">Actions</div>
                              <DropdownMenuItem className="cursor-pointer" render={<Link href={`/revendeurs/${reseller.id}`} />}>
                                <Eye className="mr-2 h-4 w-4" /> Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => setEditingReseller(reseller)}>
                                <Edit className="mr-2 h-4 w-4" /> Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => setChangingPasswordReseller(reseller)}>
                                <Key className="mr-2 h-4 w-4" /> Changer mot de passe
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {reseller.status === 'actif' ? (
                                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={async () => {
                                  try {
                                    await resellerService.updateStatus(reseller.id, 'bloque')
                                    setResellersList(resellersList.map(r => r.id === reseller.id ? {...r, status: 'bloque'} : r))
                                    toast.success("Revendeur bloqué avec succès")
                                  } catch (error) {
                                    toast.error("Erreur lors du blocage")
                                  }
                                }}>
                                  <Ban className="mr-2 h-4 w-4" /> Bloquer
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="cursor-pointer text-emerald-600 focus:text-emerald-600" onClick={async () => {
                                  try {
                                    await resellerService.updateStatus(reseller.id, 'actif')
                                    setResellersList(resellersList.map(r => r.id === reseller.id ? {...r, status: 'actif'} : r))
                                    toast.success("Revendeur réactivé avec succès")
                                  } catch (error) {
                                    toast.error("Erreur lors de la réactivation")
                                  }
                                }}>
                                  <AlertCircle className="mr-2 h-4 w-4" /> Réactiver
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredResellers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm italic">
                Aucun revendeur trouvé.
              </div>
            ) : (
              filteredResellers.map((reseller) => {
                const statusBadge = getStatusBadge(reseller.status)
                const debtPct = calcDebtPercentage(reseller.current_debt, reseller.credit_limit)
                const debtColor = getDebtColor(debtPct)

                return (
                  <div key={reseller.id} className="p-4 space-y-4 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 font-bold text-sm shadow-sm">
                          {reseller.company_name.substring(0, 1)}
                        </div>
                        <div>
                          <div className="font-black text-foreground text-base tracking-tight">{reseller.company_name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {reseller.city} • {reseller.phone}
                          </div>
                        </div>
                      </div>
                      <Badge variant={statusBadge.variant} className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">
                        {statusBadge.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] uppercase text-muted-foreground font-black tracking-widest mb-1">Dette Actuelle</p>
                        <p className="text-sm font-black text-foreground">{formatCurrency(reseller.current_debt)}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] uppercase text-muted-foreground font-black tracking-widest mb-1">Plafond</p>
                        <p className="text-sm font-black text-foreground">{formatCurrency(reseller.credit_limit)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex justify-between items-end mb-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Utilisation</span>
                          <span className={cn("text-xs font-black", debtColor)}>{debtPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-500", 
                              debtPct >= 90 ? "bg-red-600" : debtPct >= 70 ? "bg-orange-500" : "bg-emerald-500"
                            )} 
                            style={{ width: `${debtPct}%` }}
                          />
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-slate-100 dark:border-slate-800">
                            <MoreVertical size={18} className="text-slate-500" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl">
                          <DropdownMenuItem className="rounded-xl h-12 gap-3" render={<Link href={`/revendeurs/${reseller.id}`} />}>
                            <Eye size={18} /> <span className="font-bold">Voir détails</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl h-12 gap-3" onClick={() => setEditingReseller(reseller)}>
                            <Edit size={18} /> <span className="font-bold">Modifier</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl h-12 gap-3" onClick={() => setChangingPasswordReseller(reseller)}>
                            <Key size={18} /> <span className="font-bold">Mot de passe</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1" />
                          {reseller.status === 'actif' ? (
                            <DropdownMenuItem className="rounded-xl h-12 gap-3 text-red-600 focus:text-red-600" onClick={async () => {
                              try {
                                await resellerService.updateStatus(reseller.id, 'bloque')
                                setResellersList(resellersList.map(r => r.id === reseller.id ? {...r, status: 'bloque'} : r))
                                toast.success("Revendeur bloqué")
                              } catch (error) {
                                toast.error("Erreur lors du blocage")
                              }
                            }}>
                              <Ban size={18} /> <span className="font-bold">Bloquer</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="rounded-xl h-12 gap-3 text-emerald-600 focus:text-emerald-600" onClick={async () => {
                              try {
                                await resellerService.updateStatus(reseller.id, 'actif')
                                setResellersList(resellersList.map(r => r.id === reseller.id ? {...r, status: 'actif'} : r))
                                toast.success("Revendeur réactivé")
                              } catch (error) {
                                toast.error("Erreur lors de la réactivation")
                              }
                            }}>
                              <AlertCircle size={18} /> <span className="font-bold">Réactiver</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div>Affichage de {filteredResellers.length} revendeur(s)</div>
            {/* Pagination placeholder */}
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Précédent</Button>
              <Button variant="outline" size="sm" disabled>Suivant</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODAL DE MODIFICATION */}
      <Dialog open={!!editingReseller} onOpenChange={(open) => !open && setEditingReseller(null)}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-950">
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 px-6 py-6 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white font-bold tracking-tight">Modifier le distributeur</DialogTitle>
                <DialogDescription className="text-slate-200/80">
                  Mettez à jour les informations de {editingReseller?.company_name}.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="px-6 py-6 grid gap-5 bg-white dark:bg-slate-950">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
                    Nom de la société
                  </Label>
                  <Input id="edit-name" defaultValue={editingReseller?.company_name} className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-500 transition-all shadow-sm text-foreground" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-matricule" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
                      Matricule Fiscal
                    </Label>
                    <Input id="edit-matricule" defaultValue="1234567X/A/M/000" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-500 transition-all shadow-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-region" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
                      Région
                    </Label>
                    <Input id="edit-region" defaultValue={editingReseller?.city} className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-500 transition-all shadow-sm text-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-manager" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
                      Gérant
                    </Label>
                    <Input id="edit-manager" defaultValue={editingReseller?.manager_name} className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-500 transition-all shadow-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
                      Téléphone
                    </Label>
                    <Input id="edit-phone" defaultValue={editingReseller?.phone} className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-500 transition-all shadow-sm text-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-limit" className="text-slate-700 dark:text-slate-200 font-semibold text-sm">
                    Plafond de crédit (DT)
                  </Label>
                  <div className="relative">
                    <Input id="edit-limit" type="number" defaultValue={editingReseller?.credit_limit} className="h-11 pl-4 pr-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-500 font-semibold text-lg transition-all shadow-sm text-foreground" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      DT
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <DialogClose render={<Button type="button" variant="outline" className="h-10 bg-white dark:bg-slate-950">Annuler</Button>} />
              <Button type="button" className="bg-slate-800 hover:bg-slate-900 text-white font-medium shadow-lg px-6 h-10" onClick={async () => {
                const name = (document.getElementById('edit-name') as HTMLInputElement).value;
                const manager = (document.getElementById('edit-manager') as HTMLInputElement).value;
                const phone = (document.getElementById('edit-phone') as HTMLInputElement).value;
                const region = (document.getElementById('edit-region') as HTMLInputElement).value;
                const limit = Number((document.getElementById('edit-limit') as HTMLInputElement).value);
                
                try {
                  const updated = await resellerService.update(editingReseller.id, {
                    company_name: name,
                    manager_name: manager,
                    phone: phone,
                    city: region,
                    credit_limit: limit
                  });
                  
                  setResellersList(resellersList.map(r => r.id === editingReseller.id ? updated : r));
                  setEditingReseller(null);
                  toast.success('Informations modifiées avec succès !');
                } catch (error) {
                  toast.error('Erreur lors de la modification');
                }
              }}>
                Enregistrer les modifications
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL CHANGEMENT MOT DE PASSE */}
      <Dialog open={!!changingPasswordReseller} onOpenChange={(open) => !open && setChangingPasswordReseller(null)}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-950">
          <div className="bg-gradient-to-br from-amber-500 to-amber-700 px-6 py-6 text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <DialogHeader>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
                <ShieldCheck size={24} className="text-white" />
              </div>
              <DialogTitle className="text-2xl text-white font-bold tracking-tight">Sécurité du compte</DialogTitle>
              <DialogDescription className="text-amber-100/80">
                Changement du mot de passe pour {changingPasswordReseller?.company_name}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="px-6 py-6 space-y-4 bg-white dark:bg-slate-950">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" placeholder="••••••••" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-amber-500 transition-all shadow-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Confirmer le mot de passe</Label>
              <Input id="confirm-password" type="password" placeholder="••••••••" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-amber-500 transition-all shadow-sm" />
            </div>
          </div>
          
          <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <DialogClose render={<Button type="button" variant="outline" className="h-10 bg-white dark:bg-slate-950">Annuler</Button>} />
            <Button type="button" className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg px-6 h-10" onClick={() => {
              const pass = (document.getElementById('new-password') as HTMLInputElement).value;
              const confirm = (document.getElementById('confirm-password') as HTMLInputElement).value;
              
              if (!pass) return toast.error('Veuillez saisir un mot de passe');
              if (pass !== confirm) return toast.error('Les mots de passe ne correspondent pas');
              
              setResellersList(resellersList.map(r => r.id === changingPasswordReseller.id ? { ...r, password: pass } : r));
              setChangingPasswordReseller(null);
              toast.success('Le mot de passe a été mis à jour avec succès !');
            }}>
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
