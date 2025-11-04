import Login from '@/components/auth/Login'
import Dashboard from '@/components/dashboard/Dashboard'
import Accounts from '@/components/accounts/Accounts'
import Layout from '@/components/sections/Layout'
import ProtectedRoute from '@/routing/ProtectedRoute'
import { Routes, Route } from 'react-router-dom'
import RecurringPayments from './components/recurring-payments/RecurringPayments'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/recurring-payments" element={<RecurringPayments />} />
        </Route>
      </Route>
    </Routes>
  )
}
