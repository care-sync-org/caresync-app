import { NotificationProvider, EventProvider } from '@caresync/shared';
export declare function createAppointment(userId: string, body: unknown, notificationProvider: NotificationProvider, eventProvider: EventProvider): Promise<{
    patient: {
        user: {
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
    };
    doctor: {
        user: {
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        userId: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        licenseNumber: string;
        specialization: string;
        department: string | null;
        bio: string | null;
        isAvailable: boolean;
    };
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
}>;
export declare function updateAppointment(appointmentId: string, userId: string, role: string, body: unknown, notificationProvider: NotificationProvider, eventProvider: EventProvider): Promise<{
    patient: {
        user: {
            id: string;
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
    };
    doctor: {
        user: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        userId: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        licenseNumber: string;
        specialization: string;
        department: string | null;
        bio: string | null;
        isAvailable: boolean;
    };
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
}>;
export declare function getAppointmentById(appointmentId: string): Promise<{
    patient: {
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
    };
    doctor: {
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
        licenseNumber: string;
        specialization: string;
        department: string | null;
        bio: string | null;
        isAvailable: boolean;
    };
    documents: {
        id: string;
        userId: string;
        appointmentId: string | null;
        medicalRecordId: string | null;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        storageKey: string;
        uploadedAt: Date;
        aiSummary: string | null;
        aiSummaryStatus: string;
    }[];
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
}>;
export declare function getAllAppointments(query: {
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
        doctor: {
            user: {
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            userId: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            licenseNumber: string;
            specialization: string;
            department: string | null;
            bio: string | null;
            isAvailable: boolean;
        };
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
