"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStorageProvider = createStorageProvider;
exports.createNotificationProvider = createNotificationProvider;
exports.createEventProvider = createEventProvider;
exports.createQueueProvider = createQueueProvider;
const path_1 = __importDefault(require("path"));
const LocalStorageProvider_1 = require("../providers/implementations/LocalStorageProvider");
const S3StorageProvider_1 = require("../providers/implementations/S3StorageProvider");
const DatabaseNotificationProvider_1 = require("../providers/implementations/DatabaseNotificationProvider");
const ConsoleEventProvider_1 = require("../providers/implementations/ConsoleEventProvider");
const LocalQueueProvider_1 = require("../providers/implementations/LocalQueueProvider");
const HttpMockQueueProvider_1 = require("../providers/implementations/HttpMockQueueProvider");
/**
 * Provider Registry — AWS Migration Point
 *
 * Storage routing:
 *   STORAGE_PROVIDER=local  → LocalStorageProvider (default for dev)
 *   STORAGE_PROVIDER=s3     → S3StorageProvider (AWS production)
 *
 * On AWS: set STORAGE_PROVIDER=s3, S3_BUCKET_NAME, AWS_REGION via .env.aws
 */
function createStorageProvider() {
    const storageProvider = process.env.STORAGE_PROVIDER ?? 'local';
    if (storageProvider === 's3') {
        const bucketName = process.env.S3_BUCKET_NAME;
        const region = process.env.AWS_REGION ?? 'us-east-1';
        if (!bucketName) {
            throw new Error('S3_BUCKET_NAME environment variable is required when STORAGE_PROVIDER=s3');
        }
        console.log(`📦 Storage: S3 (bucket: ${bucketName}, region: ${region})`);
        return new S3StorageProvider_1.S3StorageProvider(bucketName, region);
    }
    // Default: local filesystem storage
    const uploadsDir = path_1.default.resolve(process.env.UPLOADS_DIR ?? './uploads');
    const baseUrl = `http://localhost:${process.env.PORT ?? 3000}`;
    console.log(`📂 Storage: Local (dir: ${uploadsDir})`);
    return new LocalStorageProvider_1.LocalStorageProvider(uploadsDir, baseUrl);
}
function createNotificationProvider(prisma) {
    return new DatabaseNotificationProvider_1.DatabaseNotificationProvider(prisma);
    // Future: return new SNSNotificationProvider(process.env.SNS_TOPIC_ARN!);
}
function createEventProvider() {
    return new ConsoleEventProvider_1.ConsoleEventProvider();
    // Future: return new EventBridgeProvider(process.env.EVENTBRIDGE_BUS_NAME!);
}
function createQueueProvider() {
    const provider = process.env.QUEUE_PROVIDER ?? 'local';
    if (provider === 'http') {
        const aiServiceUrl = process.env.AI_SERVICE_URL ?? 'http://ai-service:3006/internal/summarize';
        return new HttpMockQueueProvider_1.HttpMockQueueProvider({
            'ai-summary': aiServiceUrl,
        });
    }
    return new LocalQueueProvider_1.LocalQueueProvider();
    // Future: return new SQSQueueProvider(process.env.SQS_QUEUE_URL!);
}
//# sourceMappingURL=providers.js.map