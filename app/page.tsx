'use client'

import { useState, useEffect } from 'react'
import Dashboard from '@/components/dashboard'
import Profile from '@/components/profile'
import Notifications from '@/components/notifications'
import Wallet from '@/components/wallet'
import PaystackPayment from '@/components/paystack-payment'
import Spraying from '@/components/spraying'
import Redemption from '@/components/redemption'
import VendorDashboard from '@/components/vendor-dashboard'
import VendorPOS from '@/components/vendor-pos'
import QRScanner from '@/components/qr-scanner'
import Navigation from '@/components/navigation'
import ModeSwitcher from '@/components/mode-switcher'
import ThemeSelector from '@/components/theme-selector'
import CelebrantDashboard from '@/components/celebrant-dashboard'
import BuyBU from '@/components/buy-bu'
import History from '@/components/history'
import Invites from '@/components/invites'
import EventsTickets from '@/components/events-tickets'
import SendBU from '@/components/send-bu'
import ReceiveBU from '@/components/receive-bu'
import Contacts from '@/components/contacts'
import EventInfo from '@/components/event-info'
import CelebrantEventInfo from '@/components/celebrant-event-info'
import CelebrantCreateEvent from '@/components/celebrant-create-event'
import VendorCreateEvent from '@/components/vendor-create-event'
import CelebrantSendInvites from '@/components/celebrant-send-invites'
import VendorGatewaySetup from '@/components/vendor-gateway-setup'
import VendorBuyback from '@/components/vendor-buyback'
import Auth from '@/components/auth'

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [pageData, setPageData] = useState<any>(null)
  const [theme, setTheme] = useState('theme-pink')
  const [mode, setMode] = useState<'user' | 'celebrant' | 'vendor'>('user')
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string; role: 'user' | 'celebrant' | 'vendor' | 'both' | 'admin' | 'superadmin'; phoneNumber: string; name: string } | null>(null)

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page)
    setPageData(data)
  }

  useEffect(() => {
    setMounted(true)
    
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('bison-theme') || 'theme-pink'
      setTheme(savedTheme)
      
      // Check authentication via API (JWT cookie)
      const checkAuth = async () => {
        try {
          const { userApi } = await import('@/lib/api-client')
          const response = await userApi.getMe()
          
          if (response.success && response.data?.user) {
            const user = response.data.user
            setIsAuthenticated(true)
            setCurrentUser({
              id: user.id || '',
              role: user.role,
              phoneNumber: user.phoneNumber,
              name: user.name,
            })
            // Set initial mode: Guest for 'user', 'celebrant', 'admin', 'superadmin' roles, Vendor for 'vendor' and 'both' roles
            setMode(user.role === 'vendor' || user.role === 'both' ? 'vendor' : 'user')
          } else {
            // Not authenticated (401 or other error) - clear any stale sessionStorage
            // This is expected when user is not logged in, so we handle it silently
            sessionStorage.removeItem('userRole')
            sessionStorage.removeItem('userName')
          }
        } catch (error: any) {
          // Not authenticated or error - handle silently
          // 401 errors are expected when user is not logged in
          if (error?.status !== 401) {
            console.error('Auth check error:', error)
          }
          sessionStorage.removeItem('userRole')
          sessionStorage.removeItem('userName')
        }
      }
      
      checkAuth()
    }
  }, [])
  
  const handleAuthSuccess = (user: { id: string; role: 'user' | 'celebrant' | 'vendor' | 'both' | 'admin' | 'superadmin'; phoneNumber: string; name: string }) => {
    setIsAuthenticated(true)
    setCurrentUser(user)
            // Set initial mode: Guest for 'user', 'celebrant', 'admin', 'superadmin' roles, Vendor for 'vendor' and 'both' roles
            setMode(user.role === 'vendor' || user.role === 'both' ? 'vendor' : 'user')
    setCurrentPage('dashboard')
  }
  
  const handleLogout = async () => {
    try {
      // Call logout API to clear httpOnly cookie
      const { authApi } = await import('@/lib/api-client')
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    // Clear sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('userRole')
      sessionStorage.removeItem('userName')
    }
    
    setIsAuthenticated(false)
    setCurrentUser(null)
    setCurrentPage('dashboard')
  }

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem('bison-theme', theme)
      document.documentElement.className = theme
    }
  }, [theme, mounted])

  // Role-based access control function (must be defined before hooks)
  const canAccessPage = (page: string) => {
    if (page === 'dashboard' || page === 'profile' || page === 'notifications') return true
    
    // Vendor pages are restricted to vendor or both role only
    if (page.startsWith('vendor-')) {
      return (currentUser?.role === 'vendor' || currentUser?.role === 'both') && mode === 'vendor'
    }
    
    // Guest and Celebrant modes are accessible to 'user', 'celebrant', and 'both' registered roles
    if (mode === 'user') {
      // Guest mode accessible to 'user', 'celebrant', and 'both' roles
      if (currentUser?.role === 'user' || currentUser?.role === 'celebrant' || currentUser?.role === 'both') {
        return ['wallet', 'spraying', 'redemption', 'buy-bu', 'history', 'invites', 'events', 'event-info', 'send-bu', 'receive-bu', 'contacts', 'paystack-payment'].includes(page)
      }
      return false
    } else if (mode === 'celebrant') {
      // Celebrant mode accessible to 'user', 'celebrant', and 'both' roles
      if (currentUser?.role === 'user' || currentUser?.role === 'celebrant' || currentUser?.role === 'both') {
        return ['wallet', 'redemption', 'history', 'celebrant-event-info', 'celebrant-create-event', 'celebrant-send-invites'].includes(page)
      }
      return false
    } else if (mode === 'vendor') {
      // Vendor mode accessible if registered as vendor or both
      if (currentUser?.role === 'vendor' || currentUser?.role === 'both') {
        return ['wallet', 'spraying', 'vendor-gateway-setup', 'vendor-buyback'].includes(page)
      }
      return false
    }
    return false
  }

  // Redirect to dashboard if trying to access unauthorized page
  // This hook MUST be called before any early returns
  useEffect(() => {
    if (mounted && isAuthenticated && currentUser) {
      // If trying to access vendor mode but not registered as vendor or both, switch to user mode
      if (mode === 'vendor' && currentUser.role !== 'vendor' && currentUser.role !== 'both') {
        setMode('user')
        setCurrentPage('dashboard')
      } else if (!canAccessPage(currentPage)) {
        fetch('http://127.0.0.1:7242/ingest/5302d33a-07c7-4c7f-8d80-24b4192edc7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:143',message:'Page access denied, redirecting to dashboard',data:{currentPage,canAccess:canAccessPage(currentPage),mode,userRole:currentUser.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        setCurrentPage('dashboard')
      } else {
        fetch('http://127.0.0.1:7242/ingest/5302d33a-07c7-4c7f-8d80-24b4192edc7b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:147',message:'Page access granted',data:{currentPage,canAccess:canAccessPage(currentPage),mode,userRole:currentUser.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      }
    }
  }, [currentPage, mounted, isAuthenticated, mode, currentUser])

  // Show loading state instead of null to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl">ɃU</div>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <div className={`${theme} min-h-screen bg-background text-foreground`}>
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          {currentPage !== 'dashboard' && (
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="text-xl text-foreground transition hover:text-primary"
            >
              ←
            </button>
          )}
          {currentPage === 'dashboard' && <div />}
          <h1 className="text-lg font-bold capitalize text-primary">
            {currentPage === 'dashboard' && mode === 'user' ? 'Celebrate' : currentPage === 'dashboard' && mode === 'celebrant' ? 'Celebrant' : currentPage === 'dashboard' && mode === 'vendor' ? 'Vendor' : currentPage}
          </h1>
          <ThemeSelector theme={theme} onThemeChange={setTheme} />
        </div>

        {/* Mode Switcher */}
        {currentPage === 'dashboard' && <ModeSwitcher currentMode={mode} onModeChange={setMode} userRole={currentUser?.role} />}

        {/* Content */}
        <div>
          {mode === 'user' ? (
            <>
              {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
              {currentPage === 'wallet' && <Wallet onNavigate={handleNavigate} />}
              {currentPage === 'spraying' && <Spraying />}
              {currentPage === 'redemption' && <Redemption 
                allowWalletWithdrawal={pageData?.allowWalletWithdrawal || false}
                eventId={pageData?.eventId}
                eventName={pageData?.eventName}
                eventBalance={pageData?.eventBalance}
                eventWithdrawn={pageData?.eventWithdrawn}
              />}
              {currentPage === 'profile' && <Profile onNavigate={handleNavigate} onLogout={handleLogout} />}
              {currentPage === 'notifications' && <Notifications onNavigate={handleNavigate} />}
              {currentPage === 'buy-bu' && <BuyBU />}
              {currentPage === 'history' && <History />}
              {currentPage === 'invites' && <Invites />}
              {currentPage === 'events' && <EventsTickets onNavigate={handleNavigate} initialData={pageData} />}
              {currentPage === 'event-info' && <EventInfo eventId={pageData} onNavigate={handleNavigate} />}
              {currentPage === 'send-bu' && <SendBU />}
              {currentPage === 'receive-bu' && <ReceiveBU />}
              {currentPage === 'contacts' && <Contacts onNavigate={handleNavigate} />}
              {currentPage === 'paystack-payment' && (
                <PaystackPayment
                  onSuccess={() => {
                    handleNavigate('wallet')
                    // Refresh wallet data by reloading
                    window.location.reload()
                  }}
                  onCancel={() => handleNavigate('wallet')}
                />
              )}
            </>
          ) : mode === 'celebrant' ? (
            <>
              {currentPage === 'dashboard' && <CelebrantDashboard onNavigate={handleNavigate} />}
              {currentPage === 'wallet' && <Wallet onNavigate={handleNavigate} />}
              {currentPage === 'redemption' && <Redemption 
                allowWalletWithdrawal={pageData?.allowWalletWithdrawal || false}
                eventId={pageData?.eventId}
                eventName={pageData?.eventName}
                eventBalance={pageData?.eventBalance}
                eventWithdrawn={pageData?.eventWithdrawn}
              />}
              {currentPage === 'history' && <History />}
              {currentPage === 'notifications' && <Notifications onNavigate={handleNavigate} />}
              {currentPage === 'celebrant-event-info' && <CelebrantEventInfo eventId={pageData} onNavigate={handleNavigate} />}
              {currentPage === 'celebrant-create-event' && <CelebrantCreateEvent onNavigate={handleNavigate} />}
              {currentPage === 'celebrant-send-invites' && <CelebrantSendInvites eventId={pageData} onNavigate={handleNavigate} />}
              {currentPage === 'profile' && <Profile onNavigate={handleNavigate} onLogout={handleLogout} />}
            </>
          ) : (
            <>
              {currentPage === 'dashboard' && <VendorDashboard onNavigate={handleNavigate} />}
              {currentPage === 'wallet' && <VendorPOS onNavigate={handleNavigate} />}
              {currentPage === 'spraying' && <QRScanner mode={mode} />}
              {currentPage === 'notifications' && <Notifications onNavigate={handleNavigate} />}
              {currentPage === 'vendor-gateway-setup' && <VendorGatewaySetup onNavigate={handleNavigate} />}
              {currentPage === 'vendor-buyback' && <VendorBuyback onNavigate={handleNavigate} />}
              {currentPage === 'vendor-create-event' && <VendorCreateEvent onNavigate={handleNavigate} />}
              {currentPage === 'profile' && <Profile onNavigate={handleNavigate} onLogout={handleLogout} />}
            </>
          )}
        </div>

        {/* Navigation */}
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} mode={mode} />
      </div>
    </div>
  )
}
