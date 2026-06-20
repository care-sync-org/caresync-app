import { Role } from '@prisma/client';
export interface JwtPayload {
    userId: string;
    email: string;
    role: Role;
}
export interface AuthenticatedRequest extends Express.Request {
    user?: JwtPayload;
}
export interface PaginationQuery {
    page?: string;
    limit?: string;
}
export interface ApiResponse<T = unknown> {
    data?: T;
    message?: string;
    error?: string;
    statusCode: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';
export declare const ALLOWED_MIME_TYPES: string[];
export declare const MAX_FILE_SIZE: number;
//# sourceMappingURL=index.d.ts.map