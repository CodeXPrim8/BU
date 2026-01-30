import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cmqtnppqpksvyhtqrcqi.supabase.co'
// Support both variable names (anon_key is standard, publishable_key is what user provided)
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ''

// Validate that we have a real API key (not a placeholder)
if (supabaseAnonKey && (supabaseAnonKey.includes('your_supabase') || supabaseAnonKey.length < 50)) {
  console.error('⚠️  WARNING: Invalid or placeholder Supabase API key detected!')
  console.error('   Key length:', supabaseAnonKey.length)
  console.error('   Key preview:', supabaseAnonKey.substring(0, 30))
  console.error('   Please ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is set correctly in .env.local')
  console.error('   and restart your development server.')
  // Don't throw here, let Supabase handle the error with a clearer message
}

// #region agent log
if (typeof window === 'undefined') {
  const envAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const envPublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ''
  fetch('http://127.0.0.1:7242/ingest/5302d33a-07c7-4c7f-8d80-24b4192edc7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase.ts:8',message:'Supabase config check',data:{hasUrl:!!supabaseUrl,urlLength:supabaseUrl?.length||0,envAnonKeyExists:!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,envAnonKeyLength:envAnonKey.length,envAnonKeyPrefix:envAnonKey.substring(0,30),envPublishableKeyExists:!!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,envPublishableKeyLength:envPublishableKey.length,envPublishableKeyPrefix:envPublishableKey.substring(0,30),finalAnonKeyLength:supabaseAnonKey?.length||0,finalAnonKeyPrefix:supabaseAnonKey?.substring(0,30)||'none',finalAnonKeySuffix:supabaseAnonKey?.substring(Math.max(0,supabaseAnonKey.length-30))||'none'},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
}
// #endregion agent log

// Create Supabase client for server-side operations
// Add db schema option to ensure we're using the public schema
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
})

// Create Supabase client for client-side operations (with RLS)
export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}
