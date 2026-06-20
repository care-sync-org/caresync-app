export declare function getDashboardStats(): Promise<{
    stats: {
        totalUsers: number;
        totalPatients: number;
        totalDoctors: number;
        totalAppointments: number;
    };
    appointmentsByStatus: {
        status: import(".prisma/client").$Enums.AppointmentStatus;
        count: number;
    }[];
    recentActivity: ({
        user: {
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        userId: string | null;
        createdAt: Date;
        action: string;
        resource: string;
        resourceId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    })[];
}>;
export declare function getAllUsers(query: {
    page?: string;
    limit?: string;
    role?: string;
}): Promise<{
    data: {
        id: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        firstName: string;
        lastName: string;
        isActive: boolean;
    }[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare function toggleUserStatus(targetUserId: string, adminUserId: string): Promise<{
    id: string;
    email: string;
    isActive: boolean;
}>;
export declare function createDoctor(body: unknown, adminUserId: string): Promise<{
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
} & {
    id: string;
    userId: string;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
    specialization: string;
    licenseNumber: string;
    department: string | null;
    bio: string | null;
    isAvailable: boolean;
}>;
export declare function getAuditLogs(query: {
    page?: string;
    limit?: string;
}): Promise<{
    data: ({
        user: {
            email: string;
            role: import(".prisma/client").$Enums.Role;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        userId: string | null;
        createdAt: Date;
        action: string;
        resource: string;
        resourceId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    })[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
