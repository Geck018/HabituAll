import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './auth/AuthContext'
import { SessionCryptoProvider } from './auth/SessionCryptoContext'
import { PreferencesProvider } from './customization/PreferencesContext'
import { VaultProvider } from './privacy/VaultContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SessionCryptoProvider>
        <PreferencesProvider>
          <VaultProvider>
            <App />
          </VaultProvider>
        </PreferencesProvider>
      </SessionCryptoProvider>
    </AuthProvider>
  </StrictMode>,
)
