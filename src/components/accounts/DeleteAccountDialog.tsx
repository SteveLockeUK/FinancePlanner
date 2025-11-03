import Dialog from '@/components/ui/Dialog'
import type Account from '@/data/models/Account'

interface DeleteAccountDialogProps {
    isOpen: boolean
    onClose: () => void
    onDelete: (id: number) => void
    account?: Account | null
}

export default function DeleteAccountDialog({ isOpen, onClose, onDelete, account = null }: DeleteAccountDialogProps) {
    if (!account) {
        return null
    }

    const handleDelete = () => {
        onDelete(account.id)
        onClose()
    }

    const handleCancel = () => {
        onClose()
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleCancel}
            title="Delete Account"
        >
            <form onSubmit={(e) => { e.preventDefault(); handleDelete(); }}>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                Are you sure you want to delete this account?
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="space-y-2">
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Account Name:</span>
                                    <p className="text-base font-semibold text-gray-900 mt-1">{account.name}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Balance:</span>
                                    <p className="text-base font-semibold text-gray-900 mt-1">
                                        {account.balance.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-red-800">
                                ⚠️ Warning: This action cannot be undone.
                            </p>
                        </div>
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
                        className="btn-danger flex-1"
                    >
                        Delete Account
                    </button>
                </div>
            </form>
        </Dialog>
    )
}