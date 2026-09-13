import { createClient } from '@supabase/supabase-js';

let url = (process.argv[2] || process.env.VITE_SUPABASE_URL || '').trim();
const key = (process.argv[3] || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Sanitize URL: strip /rest/v1 or trailing slashes
if (url) {
  url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

if (!url || !key || url.includes('seu-projeto') || key.includes('sua-chave')) {
  console.log(JSON.stringify({
    success: false,
    message: 'URL e Anon Key do Supabase não configurados ainda.',
    configured: false
  }, null, 2));
  process.exit(0);
}

async function testConnection() {
  const results = {
    url,
    success: true,
    categories: { exists: false, count: 0, error: null },
    expenses: { exists: false, count: 0, error: null },
    notification_settings: { exists: false, count: 0, error: null },
    storage_comprovantes: { exists: false, error: null },
  };

  try {
    const supabase = createClient(url, key);

    // 1. Test categories
    const { data: catData, error: catError, count: catCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact' });

    if (catError) {
      results.categories.error = catError.message;
      results.success = false;
    } else {
      results.categories.exists = true;
      results.categories.count = catCount ?? (catData ? catData.length : 0);
    }

    // 2. Test expenses
    const { data: expData, error: expError, count: expCount } = await supabase
      .from('expenses')
      .select('*', { count: 'exact' });

    if (expError) {
      results.expenses.error = expError.message;
      results.success = false;
    } else {
      results.expenses.exists = true;
      results.expenses.count = expCount ?? (expData ? expData.length : 0);
    }

    // 3. Test notification_settings
    const { data: notifData, error: notifError, count: notifCount } = await supabase
      .from('notification_settings')
      .select('*', { count: 'exact' });

    if (notifError) {
      results.notification_settings.error = notifError.message;
      results.success = false;
    } else {
      results.notification_settings.exists = true;
      results.notification_settings.count = notifCount ?? (notifData ? notifData.length : 0);
    }

    // 4. Test storage bucket 'comprovantes'
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .getBucket('comprovantes');

    if (bucketError) {
      results.storage_comprovantes.error = bucketError.message;
    } else {
      results.storage_comprovantes.exists = true;
    }

    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      success: false,
      error: err.message
    }, null, 2));
  }
}

testConnection();
