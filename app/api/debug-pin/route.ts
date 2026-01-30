import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyPin, hashPin } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-helpers'

// Debug endpoint to test PIN verification
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const body = await request.json()
    const { pin, testPin } = body

    if (!userId) {
      return errorResponse('User ID required', 401)
    }

    // Get user's PIN hash
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone_number, pin_hash')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return errorResponse('User not found', 404)
    }

    const results: any = {
      userId: user.id,
      phoneNumber: user.phone_number,
      hasPinHash: !!user.pin_hash,
      pinHashLength: user.pin_hash?.length || 0,
      pinHashPrefix: user.pin_hash?.substring(0, 20) || 'N/A',
    }

    // Test PIN verification if provided
    if (testPin) {
      try {
        const isValid = await verifyPin(testPin, user.pin_hash)
        results.pinVerification = {
          testPin: testPin,
          isValid: isValid,
          error: null,
        }
      } catch (error: any) {
        results.pinVerification = {
          testPin: testPin,
          isValid: false,
          error: error.message,
        }
      }
    }

    // Test creating a new hash if PIN provided
    if (pin) {
      try {
        const newHash = await hashPin(pin)
        results.newHashTest = {
          success: true,
          hashLength: newHash.length,
          hashPrefix: newHash.substring(0, 20),
        }
      } catch (error: any) {
        results.newHashTest = {
          success: false,
          error: error.message,
        }
      }
    }

    return successResponse(results)
  } catch (error: any) {
    console.error('Debug PIN error:', error)
    return errorResponse('Internal server error', 500)
  }
}
