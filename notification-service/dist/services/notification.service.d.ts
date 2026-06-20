import { NotificationProvider } from '@caresync/shared';
export declare function getNotifications(userId: string, query: {
    page?: string;
    limit?: string;
}, notificationProvider: NotificationProvider): Promise<{
    data: import("@caresync/shared").NotificationRecord[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare function getUnreadCount(userId: string, notificationProvider: NotificationProvider): Promise<number>;
export declare function markNotificationRead(notificationId: string, userId: string, notificationProvider: NotificationProvider): Promise<void>;
export declare function markAllRead(userId: string, notificationProvider: NotificationProvider): Promise<void>;
