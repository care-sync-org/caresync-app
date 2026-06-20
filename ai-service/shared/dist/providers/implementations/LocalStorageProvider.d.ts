import { StorageProvider, UploadedFile } from '../interfaces/StorageProvider';
export declare class LocalStorageProvider implements StorageProvider {
    private readonly uploadsDir;
    private readonly baseUrl;
    constructor(uploadsDir: string, baseUrl: string);
    uploadFile(buffer: Buffer, originalName: string, mimeType: string, folder?: string): Promise<UploadedFile>;
    downloadFile(key: string): Promise<Buffer>;
    deleteFile(key: string): Promise<void>;
    getFileUrl(key: string): Promise<string>;
    fileExists(key: string): Promise<boolean>;
    getUploadUrl(originalName: string, mimeType: string, folder?: string): Promise<{
        url: string;
        key: string;
        filename: string;
    }>;
}
//# sourceMappingURL=LocalStorageProvider.d.ts.map