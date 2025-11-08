import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/index.css'
import App from '@/App.tsx'
import { authService } from '@/data/services/authService'

// Register service worker and initialize SignalR if user is already authenticated
if (typeof window !== 'undefined') {    
    // Check if user is already authenticated (e.g., after page refresh) and start SignalR
    authService.initializeIfAuthenticated();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>    
  </StrictMode>
)