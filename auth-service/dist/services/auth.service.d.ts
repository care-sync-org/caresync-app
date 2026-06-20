export declare function login(body: unknown, ipAddress?: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        email: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        firstName: string;
        lastName: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
}>;
export declare function register(body: unknown, ipAddress?: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        email: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        firstName: string;
        lastName: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
}>;
export declare function refreshTokens(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
}>;
export declare function getMe(userId: string): Promise<{
    email: string;
    id: string;
    role: import(".prisma/client").$Enums.Role;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: Date;
    patient: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        dateOfBirth: Date | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        phone: string | null;
        address: string | null;
        bloodGroup: string | null;
        emergencyContact: string | null;
        userId: string;
    } | null;
    doctor: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        userId: string;
        specialization: string;
        licenseNumber: string;
        department: string | null;
        bio: string | null;
        isAvailable: boolean;
    } | null;
}>;
