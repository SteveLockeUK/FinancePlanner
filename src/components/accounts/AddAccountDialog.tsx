import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import type Account from '@/data/models/Account'

interface AddAccountDialogProps {
    isOpen: boolean
    onClose: () => void
    onSave: (account: Omit<Account, 'id'>) => void
}

export default function AddAccountDialog({ isOpen, onClose, onSave }: AddAccountDialogProps) {
    const [formData, setFormData] = useState({ name: '', initialBalance: '' })

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', initialBalance: '' })
        }
    }, [isOpen])

    const handleSave = () => {
        if (!formData.name.trim() || !formData.initialBalance.trim()) {
            return
        }

        const initialBalance = parseFloat(formData.initialBalance)
        if (isNaN(initialBalance)) {
            return
        }

        onSave({
            name: formData.name.trim(),
            balance: initialBalance,
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
            title="Add Account"
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
                        <label htmlFor="initialBalance" className="block text-sm font-medium text-gray-700 mb-2">
                            Initial Balance
                        </label>
                        <input
                            type="number"
                            id="initialBalance"
                            step="0.01"
                            value={formData.initialBalance}
                            onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                            placeholder="0.00"
                        />
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
                        disabled={!formData.name.trim() || !formData.initialBalance.trim() || isNaN(parseFloat(formData.initialBalance))}
                        className="btn flex-1"
                    >
                        Save
                    </button>
                </div>
            </form>
        </Dialog>
    )
}

