import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Test Supabase connection and table access
export async function GET() {
  const results: any = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    tests: {},
  }

  try {
    // Test 1: Try to query users table directly
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1)
      
      results.tests.directQuery = {
        success: !error,
        error: error ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        } : null,
        dataCount: data?.length || 0,
      }
    } catch (e: any) {
      results.tests.directQuery = {
        success: false,
        error: { message: e.message },
      }
    }

    // Test 2: Try with explicit schema
    try {
      const { data, error } = await supabase
        .schema('public')
        .from('users')
        .select('*')
        .limit(1)
      
      results.tests.explicitSchema = {
        success: !error,
        error: error ? {
          message: error.message,
          code: error.code,
        } : null,
      }
    } catch (e: any) {
      results.tests.explicitSchema = {
        success: false,
        error: { message: e.message },
        note: 'Schema method might not be available in this Supabase version',
      }
    }

    // Test 3: Check if we can list tables using RPC (if available)
    try {
      // This might not work, but let's try
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('exec_sql', { 
          query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'" 
        })
        .catch(() => ({ data: null, error: { message: 'RPC not available' } }))
      
      results.tests.rpcCheck = {
        available: !rpcError,
        error: rpcError ? { message: rpcError.message } : null,
      }
    } catch (e: any) {
      results.tests.rpcCheck = {
        available: false,
        error: { message: e.message },
      }
    }

    return NextResponse.json(results, { status: 200 })
  } catch (error: any) {
    results.error = error.message
    return NextResponse.json(results, { status: 500 })
  }
}
