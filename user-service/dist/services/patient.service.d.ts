export declare function getPatientProfile(userId: string): Promise<{
    user: {
        id: string;
        createdAt: Date;
        email: string;
        firstName: string;
        lastName: string;
    };
} & {
    id: string;
    userId: string;
    dateOfBirth: Date | null;
    gender: import(".prisma/client").$Enums.Gender | null;
    phone: string | null;
    address: string | null;
    bloodGroup: string | null;
    emergencyContact: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function getPatientById(patientId: string): Promise<{
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
} & {
    id: string;
    userId: string;
    dateOfBirth: Date | null;
    gender: import(".prisma/client").$Enums.Gender | null;
    phone: string | null;
    address: string | null;
    bloodGroup: string | null;
    emergencyContact: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updatePatientProfile(userId: string, body: unknown): Promise<{
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
} & {
    id: string;
    userId: string;
    dateOfBirth: Date | null;
    gender: import(".prisma/client").$Enums.Gender | null;
    phone: string | null;
    address: string | null;
    bloodGroup: string | null;
    emergencyContact: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function getPatientAppointments(userId: string, query: {
    page?: string;
    limit?: string;
}): Promise<{
    data: ({
        doctor: {
            user: {
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
        };
        medicalRecord: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            doctorId: string;
            notes: string | null;
            appointmentId: string;
            diagnosis: string | null;
            treatment: string | null;
            prescription: string | null;
            followUpDate: Date | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        doctorId: string;
        scheduledAt: Date;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        reason: string;
        notes: string | null;
        duration: number;
    })[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare function getAllPatients(query: {
    page?: string;
    limit?: string;
}): Promise<{
    data: ({
        user: {
            id: string;
            createdAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            isActive: boolean;
        };
    } & {
        id: string;
        userId: string;
        dateOfBirth: Date | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        phone: string | null;
        address: string | null;
        bloodGroup: string | null;
        emergencyContact: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
