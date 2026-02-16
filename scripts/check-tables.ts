import { createClient } from '@supabase/supabase-js';

async function checkTables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Missing env vars');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Try to select from organizations table
  const { data, error } = await supabase.from('organizations').select('*').limit(1);

  if (error) {
    console.log('organizations table does NOT exist:', error.message);
    process.exit(1);
  } else {
    console.log('organizations table EXISTS. Row count:', data?.length || 0);
    process.exit(0);
  }
}

checkTables();
