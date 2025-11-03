import Header from '../sections/header/Header'
import './Dashboard.css'

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  return (
    <div className="dashboard-container">
      <Header onLogout={onLogout} />
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

