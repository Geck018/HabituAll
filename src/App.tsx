import { useState } from 'react'
import { useAuth } from './auth/AuthContext'
import { useSessionCrypto } from './auth/SessionCryptoContext'
import { Layout } from './components/Layout'
import { Auth } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { HabitCreate } from './pages/HabitCreate'
import { Habits } from './pages/Habits'
import { Onboarding } from './pages/Onboarding'
import { Progress } from './pages/Progress'
import { Research } from './pages/Research'
import { Settings } from './pages/Settings'
import { Unlock } from './pages/Unlock'
import type { Page } from './domain/types'
import { AppStoreProvider, useAppStore } from './store/AppStoreContext'

function AuthenticatedApp() {
  const { data } = useAppStore()
  const [page, setPage] = useState<Page>('dashboard')

  if (!data.user.onboardingComplete) {
    return <Onboarding />
  }

  return (
    <Layout activePage={page} onNavigate={setPage}>
      {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
      {page === 'habits' && <Habits onNavigate={setPage} />}
      {page === 'habit-create' && <HabitCreate onNavigate={setPage} />}
      {page === 'progress' && <Progress onNavigate={setPage} />}
      {page === 'research' && <Research />}
      {page === 'settings' && <Settings />}
    </Layout>
  )
}

function App() {
  const { isAuthenticated, isLoading } = useAuth()
  const { isUnlocked } = useSessionCrypto()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-text-muted">
        Loading…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Auth />
  }

  if (!isUnlocked) {
    return <Unlock />
  }

  return (
    <AppStoreProvider>
      <AuthenticatedApp />
    </AppStoreProvider>
  )
}

export default App
