"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseNotificationProvider = void 0;
class DatabaseNotificationProvider {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async send(payload) {
        await this.prisma.notification.create({
            data: {
                userId: payload.userId,
                type: payload.type,
                title: payload.title,
                message: payload.message,
                metadata: payload.metadata ? payload.metadata : undefined,
            },
        });
    }
    async sendBulk(payloads) {
        await this.prisma.notification.createMany({
            data: payloads.map((p) => ({
                userId: p.userId,
                type: p.type,
                title: p.title,
                message: p.message,
                metadata: p.metadata ? p.metadata : undefined,
            })),
        });
    }
    async getUnread(userId) {
        return this.prisma.notification.findMany({
            where: { userId, isRead: false },
            orderBy: { createdAt: 'desc' },
        });
    }
    async markAsRead(notificationId, userId) {
        await this.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
    async getAll(userId, page, limit) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);
        return { notifications: notifications, total };
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({ where: { userId, isRead: false } });
    }
}
exports.DatabaseNotificationProvider = DatabaseNotificationProvider;
//# sourceMappingURL=DatabaseNotificationProvider.js.map