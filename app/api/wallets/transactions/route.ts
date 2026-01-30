import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-helpers'

// Get wallet transactions
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return errorResponse('Authentication required', 401)
    }
    
    const userId = authUser.userId
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get transfers where user is sender or receiver
    const { data: transfers, error } = await supabase
      .from('transfers')
      .select(`
        *,
        sender:users!transfers_sender_id_fkey(first_name, last_name, phone_number),
        receiver:users!transfers_receiver_id_fkey(first_name, last_name, phone_number)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return errorResponse('Failed to fetch transactions: ' + error.message, 500)
    }

    // Transform transfers to transaction format
    const transactions = transfers?.map((transfer: any) => ({
      id: transfer.id,
      type: transfer.type === 'gateway_qr' ? 'bu_transfer' : 
            transfer.sender_id === userId ? 'purchase' : 'bu_transfer',
      amount: transfer.amount,
      date: transfer.created_at,
      description: transfer.sender_id === userId
        ? `Sent to ${transfer.receiver?.first_name || 'User'}`
        : `Received from ${transfer.sender?.first_name || 'User'}`,
      status: transfer.status,
      message: transfer.message,
    })) || []

    return successResponse({ transactions, total: transactions.length })
  } catch (error: any) {
    console.error('Get transactions error:', error)
    return errorResponse('Internal server error', 500)
  }
}
