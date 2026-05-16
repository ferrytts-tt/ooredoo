import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createAdminClient()
    const { email, password, company_name, manager_name, phone, city, credit_limit } = await request.json()

    // 1. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: manager_name }
    })

    if (authError) throw authError

    // 2. Assigner le rôle 'revendeur' dans profiles (si le trigger n'est pas encore là, on le fait manuellement ici)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: manager_name,
        role: 'revendeur'
      })

    if (profileError) throw profileError

    // 3. Créer l'entrée dans la table resellers
    const { data: resellerData, error: resellerError } = await supabaseAdmin
      .from('resellers')
      .insert({
        id: authData.user.id, // On utilise le même ID que l'Auth
        company_name,
        manager_name,
        phone,
        city,
        credit_limit,
        status: 'actif',
        email
      })
      .select()
      .single()

    if (resellerError) throw resellerError

    return NextResponse.json({ success: true, reseller: resellerData })
  } catch (error: any) {
    console.error('Error creating reseller:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
}
