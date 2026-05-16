'use client'

import { useState } from 'react'
import {
  Settings,
  User,
  Shield,
  BellRing,
  Building,
  Save
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function ParametresPage() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Paramètres sauvegardés avec succès')
    }, 800)
  }

  return (
    <div className="space-y-6 animate-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez les paramètres de votre compte et de la plateforme
        </p>
      </div>

      <Tabs defaultValue="profil" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-8">
          <TabsTrigger value="profil" className="gap-2"><User size={14} className="hidden sm:block"/> Profil</TabsTrigger>
          <TabsTrigger value="entreprise" className="gap-2"><Building size={14} className="hidden sm:block"/> Entreprise</TabsTrigger>
          <TabsTrigger value="securite" className="gap-2"><Shield size={14} className="hidden sm:block"/> Sécurité</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><BellRing size={14} className="hidden sm:block"/> Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="profil">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Profil Administrateur</CardTitle>
              <CardDescription>Mettez à jour vos informations personnelles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nom complet</Label>
                  <Input defaultValue="Admin System" />
                </div>
                <div className="space-y-2">
                  <Label>Adresse email</Label>
                  <Input defaultValue="admin@ooredoo.tn" disabled />
                  <p className="text-[10px] text-muted-foreground">L&apos;email de connexion ne peut pas être modifié.</p>
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input defaultValue="+216 22 000 000" />
                </div>
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Input defaultValue="Administrateur Principal" disabled />
                </div>
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white">
                {isSaving ? 'Sauvegarde...' : <><Save size={16} className="mr-2"/> Sauvegarder les modifications</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entreprise">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Informations de l&apos;Entreprise</CardTitle>
              <CardDescription>Détails qui apparaîtront sur les reçus et rapports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom de la société</Label>
                  <Input defaultValue="Ooredoo Distribution Master" />
                </div>
                <div className="space-y-2">
                  <Label>Matricule Fiscal</Label>
                  <Input defaultValue="1234567/A/B/C/000" />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input defaultValue="Les Berges du Lac, Tunis" />
                </div>
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white">
                <Save size={16} className="mr-2"/> Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="securite">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Mot de passe et Sécurité</CardTitle>
              <CardDescription>Modifiez votre mot de passe pour sécuriser votre compte.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>Mot de passe actuel</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>Nouveau mot de passe</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirmer le nouveau mot de passe</Label>
                  <Input type="password" />
                </div>
              </div>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                Mettre à jour le mot de passe
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Préférences des Alertes</CardTitle>
              <CardDescription>Configurez les seuils de déclenchement des alertes automatiques.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6 max-w-lg">
                <div className="space-y-3">
                  <div>
                    <Label className="text-base">Seuil d&apos;alerte dette élevée</Label>
                    <p className="text-sm text-muted-foreground">Une alerte orange sera générée quand la dette dépasse ce pourcentage du plafond.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input type="number" defaultValue="70" className="w-24" />
                    <span className="text-muted-foreground font-medium">%</span>
                  </div>
                </div>
                
                <div className="border-t border-border pt-6 space-y-3">
                  <div>
                    <Label className="text-base">Seuil de blocage critique</Label>
                    <p className="text-sm text-muted-foreground">Une alerte rouge sera générée quand la dette dépasse ce pourcentage du plafond.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input type="number" defaultValue="90" className="w-24" />
                    <span className="text-muted-foreground font-medium">%</span>
                  </div>
                </div>
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white">
                <Save size={16} className="mr-2"/> Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
