import { authService } from '../../../services/authService'
import './Header.css'

interface HeaderProps {
    onLogout: () => void
}

export default function Header({ onLogout }: HeaderProps) {
    const user = authService.getCurrentUser()

    return (
        <header className="dashboard-header">
        <h1>Finance Planner</h1>
        <div className="user-info">
          {user && <span>Welcome, {user.name}</span>}
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
    )
}