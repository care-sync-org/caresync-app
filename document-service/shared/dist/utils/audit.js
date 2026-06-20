"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
const database_1 = __importDefault(require("../config/database"));
const client_1 = require("@prisma/client");
async function createAuditLog(params) {
    await database_1.default.auditLog.create({
        data: {
            userId: params.userId ?? null,
            action: params.action,
            resource: params.resource,
            resourceId: params.resourceId ?? null,
            details: params.details ? params.details : client_1.Prisma.JsonNull,
            ipAddress: params.ipAddress ?? null,
            userAgent: params.userAgent ?? null,
        },
    });
}
//# sourceMappingURL=audit.js.map