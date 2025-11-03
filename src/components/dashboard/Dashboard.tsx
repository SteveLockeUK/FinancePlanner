import Header from '../sections/header/Header'

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header onLogout={onLogout} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 border border-gray-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Dashboard</h2>
            <div className="h-1 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full"></div>
          </div>          
        </div>
      </main>
    </div>
  )
}