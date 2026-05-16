import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formater un montant en TND
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount)
}

// Formater une date en français
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Formater une date courte
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

// Calculer le pourcentage de dette
export function calcDebtPercentage(debt: number, limit: number): number {
  if (limit === 0) return 0
  return Math.round((debt / limit) * 100)
}

// Calculer le crédit disponible
export function calcAvailableCredit(limit: number, debt: number, advance: number): number {
  return limit - debt + advance
}

// Obtenir la couleur selon le niveau de dette
export function getDebtColor(percentage: number): string {
  if (percentage >= 90) return 'text-red-500'
  if (percentage >= 70) return 'text-orange-500'
  if (percentage >= 50) return 'text-yellow-500'
  return 'text-green-500'
}

// Obtenir le badge de statut revendeur
export function getStatusBadge(status: string): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  switch (status) {
    case 'actif':
      return { label: 'Actif', variant: 'default' }
    case 'bloque':
      return { label: 'Bloqué', variant: 'destructive' }
    case 'suspendu':
      return { label: 'Suspendu', variant: 'secondary' }
    default:
      return { label: status, variant: 'outline' }
  }
}

// Obtenir le libellé du mode de paiement
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Espèces',
    especes: 'Espèces',
    virement: 'Virement bancaire',
    depot_bancaire: 'Dépôt bancaire',
    cheque: 'Chèque',
    traite: 'Traite',
    retour: 'Retour article',
  }
  return labels[method] || method
}

// Générer un ID unique
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Tronquer le texte
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
