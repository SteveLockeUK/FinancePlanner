export type SyncStatus = 'pending' | 'synced' | 'deleted';

export default interface BaseEntity {
    id: number;
    updatedAt: Date;
    syncStatus: SyncStatus;
}

