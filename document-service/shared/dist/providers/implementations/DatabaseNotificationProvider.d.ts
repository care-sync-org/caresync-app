import { PrismaClient } from '@prisma/client';
import { NotificationProvider, NotificationPayload, NotificationRecord } from '../interfaces/NotificationProvider';
export declare class DatabaseNotificationProvider implements NotificationProvider {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    send(payload: NotificationPayload): Promise<void>;
    sendBulk(payloads: NotificationPayload[]): Promise<void>;
    getUnread(userId: string): Promise<NotificationRecord[]>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    getAll(userId: string, page: number, limit: number): Promise<{
        notifications: NotificationRecord[];
        total: number;
    }>;
    getUnreadCount(userId: string): Promise<number>;
}
//# sourceMappingURL=DatabaseNotificationProvider.d.ts.map