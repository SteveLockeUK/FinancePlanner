import Header from '../sections/header/Header'
import Card from '../ui/Card'

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header onLogout={onLogout} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <Card title='Dashboard'></Card>
      </main>
    </div>
  )
}