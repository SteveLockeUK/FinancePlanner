import { useState, useEffect } from 'react'
import Title from '@/components/ui/Title'
import Card from '@/components/ui/Card'
import { accountStore } from '@/data/stores/AccountStore'
import { recurringPaymentStore } from '@/data/stores/RecurringPaymentStore'
import type Account from '@/data/models/Account'
import type RecurringPayment from '@/data/models/RecurringPayment'

/**
 * Calculate all payment dates for a recurring payment before a given date
 */
function calculatePaymentDates(
  payment: RecurringPayment,
  beforeDate: Date
): Date[] {
  const dates: Date[] = []
  
  // Handle dates from localStorage (they come as strings)
  const startDate = payment.startDate instanceof Date 
    ? new Date(payment.startDate) 
    : new Date(payment.startDate as string)
  const endDate = payment.endDate 
    ? (payment.endDate instanceof Date 
        ? new Date(payment.endDate) 
        : new Date(payment.endDate as string))
    : null

  // Only process active payments
  if (!payment.active) {
    return dates
  }

  // Check if payment has ended or hasn't started yet
  if (endDate && endDate < startDate) {
    return dates
  }

  // If start date is in the future, no payments yet
  if (startDate >= beforeDate) {
    return dates
  }

  let currentDate = new Date(startDate)

  while (currentDate < beforeDate) {
    // Check if payment has ended
    if (endDate && currentDate > endDate) {
      break
    }

    dates.push(new Date(currentDate))

    // Calculate next payment date based on frequency
    switch (payment.frequency) {
      case 'Weekly':
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case 'Monthly':
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
      case 'Yearly':
        currentDate.setFullYear(currentDate.getFullYear() + 1)
        break
    }
  }

  return dates
}

/**
 * Calculate the balance for an account up to a given date
 * Current Balance = starting balance + income recurring payments before date - other recurring payments before date
 */
function calculateAccountBalanceUpTo(
  account: Account,
  recurringPayments: RecurringPayment[],
  beforeDate: Date
): number {
  let balance = account.startingBalance;
  let payments = recurringPayments.filter(x => x.fromAccountId === account.id);
  let incomePayments = recurringPayments.filter(x => x.toAccountId === account.id);
  debugger;
  if (payments) {
    payments.forEach((payment) => {
      const paymentDates = calculatePaymentDates(payment, beforeDate)
      if (paymentDates.length === 0) {
        return
      }
      balance -= payment.amount * paymentDates.length
    })
  }

  if (incomePayments) {
    incomePayments.forEach((payment) => {
      const paymentDates = calculatePaymentDates(payment, beforeDate)
      if (paymentDates.length === 0) {
        return
      }
      balance += payment.amount * paymentDates.length
    })
  }

  return balance
}

/**
 * Calculate the current balance for an account
 * Uses TODAY as the cutoff date
 */
function calculateAccountBalance(
  account: Account,
  recurringPayments: RecurringPayment[]
): number {
  const today = new Date()
  // Set to end of today (23:59:59.999)
  const endOfToday = new Date(today)
  endOfToday.setHours(23, 59, 59, 999)
  return calculateAccountBalanceUpTo(account, recurringPayments, endOfToday)
}

/**
 * Calculate the expected balance at a given date
 */
function calculateExpectedBalance(
  account: Account,
  recurringPayments: RecurringPayment[],
  targetDate: Date
): number {
  // Set to end of day (23:59:59.999)
  const endOfTargetDate = new Date(targetDate)
  endOfTargetDate.setHours(23, 59, 59, 999)
  return calculateAccountBalanceUpTo(account, recurringPayments, endOfTargetDate)
}

/**
 * Format currency amount for display
 */
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([])
  
  // Default to first of next month
  const getDefaultDate = () => {
    const today = new Date()
    const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    return firstOfNextMonth.toISOString().split('T')[0] // Format as YYYY-MM-DD for date input
  }
  
  const [projectionDate, setProjectionDate] = useState<string>(() => getDefaultDate())

  useEffect(() => {
    setAccounts(accountStore.getAccounts())
    setRecurringPayments(recurringPaymentStore.getRecurringPayments())
  }, [])

  // Convert date string to Date object for calculations
  const projectionDateObj = new Date(projectionDate)

  return (
    <div>
      <Title text='Dashboard' />
      <div className="mb-6">
        <label htmlFor="projection-date" className="block text-sm font-medium text-gray-700 mb-2">
          Projection Date
        </label>
        <input
          type="date"
          id="projection-date"
          value={projectionDate}
          onChange={(e) => setProjectionDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => {
          const currentBalance = calculateAccountBalance(account, recurringPayments)
          const expectedBalance = calculateExpectedBalance(account, recurringPayments, projectionDateObj)
          const changeFromStart = expectedBalance - account.startingBalance
          const isPositive = changeFromStart >= 0

          return (
            <Card key={account.id} className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {account.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {account.type} • {account.currency}
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(currentBalance, account.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expected Balance</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatCurrency(expectedBalance, account.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expected Change</p>
                  <p className={`text-lg font-semibold flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    )}
                    {formatCurrency(Math.abs(changeFromStart), account.currency)}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}