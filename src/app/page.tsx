import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    if (profile?.username) {
      redirect('/chat')
    } else {
      redirect('/onboarding')
    }
  }

  redirect('/login')
}
