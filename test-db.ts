import { createClient } from './lib/supabase/server'

async function test() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('tenants').select('*').limit(1)
  console.log('Tenants:', data)
  console.log('Error:', error)
}

test()
