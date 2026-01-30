import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-helpers'

// Get current user profile
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser) {
      return errorResponse('Authentication required', 401)
    }
    
    const userId = authUser.userId

    console.log('[GET /users/me] Looking up user:', { userId, phoneNumber: authUser.phoneNumber, role: authUser.role })

    const { data: user, error } = await supabase
      .from('users')
      .select('id, phone_number, first_name, last_name, email, role, created_at')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('[GET /users/me] Supabase query error:', error)
      return errorResponse('Database error: ' + error.message, 500)
    }

    if (!user) {
      console.error('[GET /users/me] User not found in database:', { userId, phoneNumber: authUser.phoneNumber })
      // Try to find user by phone number as fallback
      const { data: userByPhone } = await supabase
        .from('users')
        .select('id, phone_number, first_name, last_name, email, role, created_at')
        .eq('phone_number', authUser.phoneNumber)
        .maybeSingle()
      
      if (userByPhone) {
        console.log('[GET /users/me] Found user by phone number:', { foundId: userByPhone.id, tokenId: userId })
        // User exists but token has wrong ID - return user data but this indicates token mismatch
        return successResponse({
          user: {
            ...userByPhone,
            name: `${userByPhone.first_name} ${userByPhone.last_name}`,
            phoneNumber: userByPhone.phone_number,
          },
        })
      }
      
      // User from token doesn't exist - token is invalid, return 401 to force re-authentication
      console.error('[GET /users/me] User from token does not exist in database - invalid token')
      return errorResponse('Authentication invalid - please log in again', 401)
    }

    return successResponse({
      user: {
        ...user,
        name: `${user.first_name} ${user.last_name}`,
        phoneNumber: user.phone_number,
      },
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser) {
      return errorResponse('Authentication required', 401)
    }
    
    const userId = authUser.userId

    const body = await request.json()
    const updateData: any = {}

    if (body.first_name) updateData.first_name = body.first_name
    if (body.last_name) updateData.last_name = body.last_name
    if (body.email !== undefined) updateData.email = body.email
    
    // Handle role upgrade to vendor
    if (body.upgrade_to_vendor === true) {
      // Get current user to check their role
      const { data: currentUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (currentUser) {
        // Upgrade role: 'user' -> 'both', 'celebrant' -> 'both', 'vendor' -> 'vendor' (no change), 'both' -> 'both' (no change)
        if (currentUser.role === 'user' || currentUser.role === 'celebrant') {
          updateData.role = 'both'
        } else if (currentUser.role === 'vendor') {
          // Already a vendor, no change needed
        } else if (currentUser.role === 'both') {
          // Already has both, no change needed
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No fields to update', 400)
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, phone_number, first_name, last_name, email, role, created_at')
      .single()

    if (error) {
      return errorResponse('Failed to update user: ' + error.message, 500)
    }

    return successResponse({
      user: {
        ...user,
        name: `${user.first_name} ${user.last_name}`,
        phoneNumber: user.phone_number,
      },
    })
  } catch (error: any) {
    console.error('Update user error:', error)
    return errorResponse('Internal server error', 500)
  }
}
