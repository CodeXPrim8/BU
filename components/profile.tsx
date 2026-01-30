'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { userApi } from '@/lib/api-client'

interface ProfileProps {
  onNavigate?: (page: string) => void
  onLogout?: () => void
}

export default function Profile({ onNavigate, onLogout }: ProfileProps) {
  const [userData, setUserData] = useState<{ 
    id?: string
    name: string
    firstName?: string
    lastName?: string
    phoneNumber: string
    email?: string
    role: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })
  const [saving, setSaving] = useState(false)
  const [upgradingVendor, setUpgradingVendor] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await userApi.getMe()
      if (response.success && response.data?.user) {
        const user = response.data.user
        setUserData({
          id: user.id,
          name: user.name || `${user.first_name} ${user.last_name}`,
          firstName: user.first_name,
          lastName: user.last_name,
          phoneNumber: user.phone_number,
          email: user.email || '',
          role: user.role,
        })
      } else {
        // Fallback to localStorage
        const storedUser = localStorage.getItem('currentUser')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setUserData({
            name: user.name,
            phoneNumber: user.phoneNumber,
            role: user.role,
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      // Fallback to localStorage
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        setUserData({
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: user.role,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleEditClick = () => {
    if (userData) {
      setEditForm({
        firstName: userData.firstName || userData.name.split(' ')[0] || '',
        lastName: userData.lastName || userData.name.split(' ').slice(1).join(' ') || '',
        email: userData.email || '',
      })
      setShowEditModal(true)
    }
  }

  const handleSaveProfile = async () => {
    if (!userData) return

    try {
      setSaving(true)
      const response = await userApi.update({
        first_name: editForm.firstName,
        last_name: editForm.lastName,
        email: editForm.email || undefined,
      })

      if (response.success && response.data?.user) {
        const updatedUser = response.data.user
        setUserData({
          id: updatedUser.id,
          name: updatedUser.name,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          phoneNumber: updatedUser.phone_number,
          email: updatedUser.email || '',
          role: updatedUser.role,
        })
        
        // Update localStorage
        const storedUser = localStorage.getItem('currentUser')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          user.name = updatedUser.name
          localStorage.setItem('currentUser', JSON.stringify(user))
        }

        setShowEditModal(false)
        alert('Profile updated successfully!')
      } else {
        alert(response.error || 'Failed to update profile')
      }
    } catch (error: any) {
      console.error('Update profile error:', error)
      alert(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleUpgradeToVendor = async () => {
    if (!userData) return

    const confirmed = confirm(
      'Register as Vendor?\n\n' +
      'This will upgrade your account to include vendor features:\n' +
      '• QR code scanning for invites\n' +
      '• Gateway setup for events\n' +
      '• Vendor dashboard and POS\n\n' +
      'You can still access Guest and Celebrant features.\n\n' +
      'Continue?'
    )

    if (!confirmed) return

    try {
      setUpgradingVendor(true)
      const response = await userApi.update({
        upgrade_to_vendor: true,
      })

      if (response.success && response.data?.user) {
        const updatedUser = response.data.user
        const newRole = updatedUser.role
        
        setUserData({
          ...userData,
          role: newRole,
        })
        
        // Update localStorage with new role
        const storedUser = localStorage.getItem('currentUser')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          user.role = newRole
          localStorage.setItem('currentUser', JSON.stringify(user))
        }

        alert('Successfully registered as Vendor! You now have access to vendor features. Switch to Vendor mode from the dashboard.')
        
        // Refresh the page to update mode switcher and navigation
        window.location.reload()
      } else {
        alert(response.error || 'Failed to register as vendor')
      }
    } catch (error: any) {
      console.error('Upgrade to vendor error:', error)
      alert(error.message || 'Failed to register as vendor')
    } finally {
      setUpgradingVendor(false)
    }
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('currentUser')
      window.location.reload()
    }
  }

  const handleMenuItemClick = (item: { title: string; action?: string; desc: string }) => {
    if (item.action) {
      onNavigate?.(item.action)
    } else {
      // Show placeholder message for features not yet implemented
      alert(`${item.title}\n\n${item.desc}\n\nThis feature is coming soon!`)
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Header */}
      <div className="space-y-4 bg-gradient-to-b from-primary to-primary/80 px-4 py-8 text-primary-foreground">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20">
            <span className="text-2xl font-bold">
              {userData ? getInitials(userData.name) : 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{userData?.name || 'User'}</h2>
            <p className="text-sm opacity-90 mt-1">{userData?.phoneNumber || ''}</p>
            <p className="text-xs opacity-75 mt-1 capitalize">
              {userData?.role === 'user' 
                ? 'Guest' 
                : userData?.role === 'both'
                ? 'Guest + Celebrant + Vendor'
                : userData?.role === 'vendor'
                ? 'Vendor'
                : userData?.role === 'celebrant'
                ? 'Celebrant'
                : userData?.role || 'User'}
            </p>
            <button 
              onClick={handleEditClick}
              className="mt-1 flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition"
            >
              <span>✏️</span>
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              icon: '📋',
              title: 'Transaction History',
              desc: 'View all your transactions',
              action: 'history',
            },
            {
              icon: '👥',
              title: 'Contacts',
              desc: 'Manage contacts and friend requests',
              action: 'contacts',
            },
            {
              icon: '💳',
              title: 'My Accounts',
              desc: 'Account details, statement, e.t.c.',
            },
            {
              icon: '📱',
              title: 'Contactless Pay',
              desc: 'Setup your account for contactless pay',
            },
            {
              icon: '🎨',
              title: 'Customization',
              desc: 'Theme, dashboard customization, e.t.c.',
            },
            {
              icon: '⚙️',
              title: 'Settings',
              desc: 'Password, PIN, Security questions',
            },
            {
              icon: '🔐',
              title: 'Request PND',
              desc: 'Post no debit restriction',
            },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleMenuItemClick(item)}
              className="rounded-xl bg-card p-4 text-left transition hover:bg-card/80"
            >
              <div className="mb-3 text-3xl">{item.icon}</div>
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-4">
        <button 
          onClick={handleLogout}
          className="w-full rounded-xl border-2 border-primary py-3 font-bold text-primary transition hover:bg-primary/10"
        >
          Log Out
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md border-primary/20 bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Edit Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-full p-1 hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">First Name</label>
                <Input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="bg-secondary text-foreground"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Last Name</label>
                <Input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="bg-secondary text-foreground"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Email (Optional)</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="bg-secondary text-foreground"
                  placeholder="Enter email address"
                />
              </div>

              {/* Register as Vendor Section */}
              {userData && userData.role !== 'vendor' && userData.role !== 'both' && (
                <div className="border-t border-border pt-4">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💼</div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Become a Vendor</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Register as a vendor to access vendor features like QR code scanning, gateway setup, and more. Start making money at events!
                        </p>
                        <Button
                          onClick={handleUpgradeToVendor}
                          disabled={upgradingVendor}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {upgradingVendor ? 'Registering...' : 'Register as Vendor'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {userData && (userData.role === 'vendor' || userData.role === 'both') && (
                <div className="border-t border-border pt-4">
                  <div className="rounded-lg border border-green-400/20 bg-green-400/5 p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-sm font-semibold text-green-400">Vendor Access Enabled</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      You have access to vendor features. Switch to Vendor mode from the dashboard to get started.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving || !editForm.firstName || !editForm.lastName}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
