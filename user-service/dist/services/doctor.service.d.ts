export declare function getDoctorProfile(userId: string): Promise<{
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
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
    specialization: string;
    licenseNumber: string;
    department: string | null;
    bio: string | null;
    isAvailable: boolean;
}>;
export declare function getDoctorById(doctorId: string): Promise<{
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
export declare function updateDoctorProfile(userId: string, body: unknown): Promise<{
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
export declare function getDoctorAppointments(userId: string, query: {
    page?: string;
    limit?: string;
    status?: string;
}): Promise<{
    data: ({
        patient: {
            user: {
                email: string;
                firstName: string;
                lastName: string;
                documents: {
                    id: string;
                    originalName: string;
                    mimeType: string;
                    size: number;
                    uploadedAt: Date;
                    aiSummary: string | null;
                    aiSummaryStatus: string;
                }[];
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
export declare function getAllDoctors(query: {
    page?: string;
    limit?: string;
}): Promise<{
    data: ({
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            isActive: boolean;
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
    })[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare function getAllDoctorsAdmin(query: {
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
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        specialization: string;
        licenseNumber: string;
        department: string | null;
        bio: string | null;
        isAvailable: boolean;
    })[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
