import { authService } from '../../../services/authService'

interface HeaderProps {
    onLogout: () => void
}

export default function Header({ onLogout }: HeaderProps) {
    const user = authService.getCurrentUser()

    return (
        <header className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 text-white px-4 sm:px-6 lg:px-8 py-4 sm:py-5 shadow-lg border-b border-emerald-900/20">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Finance Planner</h1>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              {user && (
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium">Welcome, {user.name}</span>
                </div>
              )}
              <button 
                onClick={onLogout} 
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-100 backdrop-blur-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Log out</span>
              </button>
            </div>
          </div>
        </header>
    )
}