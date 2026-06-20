import { PrismaClient } from '@prisma/client';
import { StorageProvider } from '../providers/interfaces/StorageProvider';
import { NotificationProvider } from '../providers/interfaces/NotificationProvider';
import { EventProvider } from '../providers/interfaces/EventProvider';
import { QueueProvider } from '../providers/interfaces/QueueProvider';
/**
 * Provider Registry — AWS Migration Point
 *
 * Storage routing:
 *   STORAGE_PROVIDER=local  → LocalStorageProvider (default for dev)
 *   STORAGE_PROVIDER=s3     → S3StorageProvider (AWS production)
 *
 * On AWS: set STORAGE_PROVIDER=s3, S3_BUCKET_NAME, AWS_REGION via .env.aws
 */
export declare function createStorageProvider(): StorageProvider;
export declare function createNotificationProvider(prisma: PrismaClient): NotificationProvider;
export declare function createEventProvider(): EventProvider;
export declare function createQueueProvider(): QueueProvider;
//# sourceMappingURL=providers.d.ts.map