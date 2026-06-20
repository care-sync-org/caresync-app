"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageProvider = void 0;
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3StorageProvider {
    constructor(bucketName, region) {
        this.bucketName = bucketName;
        this.client = new client_s3_1.S3Client({ region });
    }
    async uploadFile(buffer, originalName, mimeType, folder = 'uploads') {
        const ext = path_1.default.extname(originalName);
        const filename = `${(0, uuid_1.v4)()}${ext}`;
        const key = `${folder}/${filename}`;
        await this.client.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
            ContentDisposition: `attachment; filename="${originalName}"`,
        }));
        const url = `/api/documents/${filename}/download`;
        return {
            key,
            filename,
            originalName,
            mimeType,
            size: buffer.length,
            url,
        };
    }
    async downloadFile(key) {
        const response = await this.client.send(new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        }));
        if (!response.Body) {
            throw new Error(`S3 object body is empty for key: ${key}`);
        }
        const chunks = [];
        const stream = response.Body;
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }
    async deleteFile(key) {
        await this.client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        }));
    }
    async getFileUrl(key) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn: 3600 });
    }
    async fileExists(key) {
        try {
            await this.client.send(new client_s3_1.HeadObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            }));
            return true;
        }
        catch {
            return false;
        }
    }
    async getUploadUrl(originalName, mimeType, folder = 'uploads') {
        const ext = path_1.default.extname(originalName);
        const filename = `${(0, uuid_1.v4)()}${ext}`;
        const key = `${folder}/${filename}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: mimeType,
            ContentDisposition: `attachment; filename="${originalName}"`,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn: 900 }); // 15 mins
        return { url, key, filename };
    }
}
exports.S3StorageProvider = S3StorageProvider;
//# sourceMappingURL=S3StorageProvider.js.map