"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.getUnreadCount = getUnreadCount;
exports.markAsRead = markAsRead;
exports.markAllRead = markAllRead;
const notificationService = __importStar(require("../services/notification.service"));
const shared_1 = require("@caresync/shared");
const notificationProvider = (0, shared_1.createNotificationProvider)(shared_1.prisma);
async function getNotifications(req, res, next) {
    try {
        const data = await notificationService.getNotifications(req.user.userId, req.query, notificationProvider);
        res.status(200).json(data);
    }
    catch (err) {
        next(err);
    }
}
async function getUnreadCount(req, res, next) {
    try {
        const count = await notificationService.getUnreadCount(req.user.userId, notificationProvider);
        res.status(200).json({ data: { count } });
    }
    catch (err) {
        next(err);
    }
}
async function markAsRead(req, res, next) {
    try {
        await notificationService.markNotificationRead(req.params.id, req.user.userId, notificationProvider);
        res.status(200).json({ message: 'Notification marked as read' });
    }
    catch (err) {
        next(err);
    }
}
async function markAllRead(req, res, next) {
    try {
        await notificationService.markAllRead(req.user.userId, notificationProvider);
        res.status(200).json({ message: 'All notifications marked as read' });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=notification.controller.js.map