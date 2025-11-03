import { useState, useEffect } from 'react'
import Login from './components/Login'
import { authService } from './services/authService'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated()
      setIsAuthenticated(authenticated)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  // Main app content (shown when authenticated)
  const user = authService.getCurrentUser()

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Finance Planner</h1>
        <div className="user-info">
          {user && <span>Welcome, {user.name}</span>}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      <main className="app-main">
        <div className="card">
          <h2>Dashboard</h2>
          <p>You are successfully authenticated!</p>
          <p>Your session is stored in a cookie.</p>
        </div>
      </main>
    </div>
  )
}

export default App
