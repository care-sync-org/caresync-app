import { StorageProvider, NotificationProvider } from '@caresync/shared';
export declare function uploadDocument(userId: string, file: Express.Multer.File, body: {
    appointmentId?: string;
    medicalRecordId?: string;
}, storageProvider: StorageProvider, notificationProvider: NotificationProvider): Promise<{
    url: string;
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    storageKey: string;
    uploadedAt: Date;
    aiSummary: string | null;
    aiSummaryStatus: string;
    userId: string;
    appointmentId: string | null;
    medicalRecordId: string | null;
}>;
export declare function downloadDocument(documentId: string, userId: string, role: string, storageProvider: StorageProvider): Promise<{
    buffer: Buffer;
    document: {
        mimeType: string;
        originalName: string;
    };
}>;
export declare function deleteDocument(documentId: string, userId: string, role: string, storageProvider: StorageProvider): Promise<void>;
export declare function getUserDocuments(userId: string, query: {
    page?: string;
    limit?: string;
}): Promise<{
    data: {
        id: string;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        storageKey: string;
        uploadedAt: Date;
        aiSummary: string | null;
        aiSummaryStatus: string;
        userId: string;
        appointmentId: string | null;
        medicalRecordId: string | null;
    }[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare function getDocumentUrl(documentId: string, storageProvider: StorageProvider): Promise<string>;
