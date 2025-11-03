import Login from '@/components/auth/Login'
import Dashboard from '@/components/dashboard/Dashboard'
import Layout from '@/components/sections/Layout'
import ProtectedRoute from '@/routing/ProtectedRoute'
import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />}/>
        </Route>
      </Route>
    </Routes>
  )  
}
