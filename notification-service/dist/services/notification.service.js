"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.getUnreadCount = getUnreadCount;
exports.markNotificationRead = markNotificationRead;
exports.markAllRead = markAllRead;
async function getNotifications(userId, query, notificationProvider) {
    const page = parseInt(query.page ?? '1', 10);
    const limit = parseInt(query.limit ?? '10', 10);
    const { notifications, total } = await notificationProvider.getAll(userId, page, limit);
    return {
        data: notifications,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
}
async function getUnreadCount(userId, notificationProvider) {
    return notificationProvider.getUnreadCount(userId);
}
async function markNotificationRead(notificationId, userId, notificationProvider) {
    await notificationProvider.markAsRead(notificationId, userId);
}
async function markAllRead(userId, notificationProvider) {
    await notificationProvider.markAllAsRead(userId);
}
//# sourceMappingURL=notification.service.js.map