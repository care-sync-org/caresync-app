export declare function createAuditLog(params: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}): Promise<void>;
//# sourceMappingURL=audit.d.ts.map