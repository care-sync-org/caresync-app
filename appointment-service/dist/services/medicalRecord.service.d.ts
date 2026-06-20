import { NotificationProvider } from '@caresync/shared';
export declare function createMedicalRecord(userId: string, body: unknown, notificationProvider: NotificationProvider): Promise<{
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
}>;
export declare function updateMedicalRecord(recordId: string, userId: string, body: unknown): Promise<{
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
}>;
export declare function getMedicalRecordById(recordId: string): Promise<{
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
    appointment: {
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
    };
} & {
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
}>;
export declare function getPatientMedicalRecords(userId: string, query: {
    page?: string;
    limit?: string;
}): Promise<{
    data: ({
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
        appointment: {
            scheduledAt: Date;
            reason: string;
        };
    } & {
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
    })[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
