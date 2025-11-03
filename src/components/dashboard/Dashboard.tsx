import { authService } from '../../services/authService'
import './Dashboard.css'

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const user = authService.getCurrentUser()

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Finance Planner</h1>
        <div className="user-info">
          {user && <span>Welcome, {user.name}</span>}
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        <div className="card">
          <h2>Dashboard</h2>
          <p>You are successfully authenticated!</p>
          <p>Your session is stored in a cookie.</p>
        </div>
      </main>
    </div>
  )
}

