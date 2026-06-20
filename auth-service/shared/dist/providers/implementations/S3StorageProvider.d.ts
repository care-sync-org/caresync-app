import { StorageProvider, UploadedFile } from '../interfaces/StorageProvider';
export declare class S3StorageProvider implements StorageProvider {
    private readonly client;
    private readonly bucketName;
    constructor(bucketName: string, region: string);
    uploadFile(buffer: Buffer, originalName: string, mimeType: string, folder?: string): Promise<UploadedFile>;
    downloadFile(key: string): Promise<Buffer>;
    deleteFile(key: string): Promise<void>;
    getFileUrl(key: string): Promise<string>;
    fileExists(key: string): Promise<boolean>;
}
//# sourceMappingURL=S3StorageProvider.d.ts.map