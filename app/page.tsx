import { redirect } from 'next/navigation'

// Redirection par défaut vers le dashboard
export default function HomePage() {
  redirect('/dashboard')
}
