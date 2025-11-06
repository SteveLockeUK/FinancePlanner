import {Outlet} from "react-router-dom";

export default function LayoutInsecure() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-950 via-primary-800 to-primary-600 p-4 sm:p-8">
            <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-md backdrop-blur-sm">
                <Outlet />
            </div>
        </div>
    )
}