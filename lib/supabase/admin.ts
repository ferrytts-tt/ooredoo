import { createClient } from '@supabase/supabase-js'

// Client Supabase avec les droits d'administration (Service Role)
// À UTILISER UNIQUEMENT CÔTÉ SERVEUR
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
