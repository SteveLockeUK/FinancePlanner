import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import type Account from '@/data/models/Account'

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
    const [formData, setFormData] = useState({ name: account.name })

    useEffect(() => {
        if (isOpen) {
            setFormData({ name: account.name })
        }
    }, [isOpen, account])

    const handleSave = () => {
        if (!formData.name.trim()) {
            return
        }

        onSave({
            id: account.id,
            name: formData.name.trim(),
            balance: account.balance
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