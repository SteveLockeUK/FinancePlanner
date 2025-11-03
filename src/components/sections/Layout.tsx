import { Outlet } from 'react-router-dom'
import Header from './Header'
import { authService } from '@/services/authService'

export default function Layout() {
    const handleLogout = () => {
        authService.logout()
        window.location.href = '/login'
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            <Header onLogout={handleLogout} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                <Outlet />
            </main>
        </div>
    )
}