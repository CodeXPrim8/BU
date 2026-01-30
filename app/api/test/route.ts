import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Test endpoint to check Supabase connection
export async function GET() {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    return NextResponse.json({
      success: true,
      supabaseConnected: !error,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
      error: error?.message || null,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    }, { status: 500 })
  }
}
