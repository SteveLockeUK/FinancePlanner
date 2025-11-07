import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/index.css'
import App from '@/App.tsx'
import { registerServiceWorker } from '@/utils/serviceWorkerRegistration'
import { signalRService } from '@/data/services/SignalRService'
import { performInitialSync } from '@/utils/initialSync'

// Register service worker, perform initial sync, and start SignalR
if (typeof window !== 'undefined') {
    registerServiceWorker();
    // Perform initial sync and start SignalR connection after a short delay to ensure auth is ready
    setTimeout(async () => {
        await performInitialSync();
        signalRService.start();
    }, 1000);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>    
  </StrictMode>
)