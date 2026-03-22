import { createClient } from './lib/supabase/server'

async function test() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('buildings').select('name, slug')
  console.log('Buildings:', data)
  console.log('Error:', error)
}

test()
