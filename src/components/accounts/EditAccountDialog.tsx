import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import type Account from '@/data/models/Account'
import { ACCOUNT_TYPES, type AccountType } from '@/data/models/AccountType'

interface EditAccountDialogProps {
    isOpen: boolean
    onClose: () => void
    onSave: (account: Account) => void
    account?: Account | null
}

export default function EditAccountDialog({ isOpen, onClose, onSave, account = null }: EditAccountDialogProps) {
    if (!account) {
        return null
    }
    const [formData, setFormData] = useState({ name: account.name, type: account.type, currency: account.currency })

    useEffect(() => {
        if (isOpen) {
            setFormData({ name: account.name, type: account.type, currency: account.currency })
        }
    }, [isOpen, account])

    const handleSave = () => {
        if (!formData.name.trim()) {
            return
        }

        onSave({
            id: account.id,
            name: formData.name.trim(),
            startingBalance: account.startingBalance,
            createdAt: account.createdAt,
            updatedAt: new Date(Date.now()),
            type: formData.type,
            currency: formData.currency
        })

        onClose()
    }

    const handleCancel = () => {
        onClose()
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleCancel}
            title="Edit Account"
        >
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                            placeholder="Enter account name"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                        </label>
                        <select id="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as AccountType })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors">
                            {ACCOUNT_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                            Currency
                        </label>
                        <select id="currency" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors">
                            <option value="GBP">GBP</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn-neutral flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn flex-1"
                    >
                        Save
                    </button>
                </div>
            </form>
        </Dialog>
    )
}