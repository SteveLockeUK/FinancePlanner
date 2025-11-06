import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'
import { authService } from '@/services/authService'

export default function Layout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleLogout = () => {
        authService.logout()
        window.location.href = '/login'
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    };

    const closeMenu = () => {
        setIsMenuOpen(false)
    };

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            <Header onLogout={handleLogout} onMenuToggle={toggleMenu} />
            <div className="flex flex-1 relative overflow-hidden min-h-0">
                <Navigation isOpen={isMenuOpen} onClose={closeMenu} />
                <main className="flex-1 p-4 sm:p-6 w-full overflow-y-auto">
                    <div className="mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}