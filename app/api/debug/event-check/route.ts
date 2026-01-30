import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-helpers'

// Debug endpoint to check event and user IDs
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request)
    if (!authUser) {
      return errorResponse('Authentication required', 401)
    }

    const body = await request.json()
    const { event_id } = body

    if (!event_id) {
      return errorResponse('Event ID required', 400)
    }

    // Get event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, celebrant_id, created_at')
      .eq('id', event_id)
      .single()

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone_number, first_name, last_name, role')
      .eq('id', authUser.userId)
      .single()

    return successResponse({
      event: event || null,
      eventError: eventError ? eventError.message : null,
      user: user || null,
      userError: userError ? userError.message : null,
      authUser: authUser,
      match: event?.celebrant_id === authUser.userId,
      event_celebrant_id: event?.celebrant_id,
      auth_user_id: authUser.userId,
    })
  } catch (error: any) {
    console.error('Debug error:', error)
    return errorResponse('Internal server error', 500)
  }
}
