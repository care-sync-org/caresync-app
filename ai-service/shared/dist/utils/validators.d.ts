import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodEnum<["DOCTOR", "PATIENT"]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: "DOCTOR" | "PATIENT";
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: "DOCTOR" | "PATIENT";
}>;
export declare const createAppointmentSchema: z.ZodObject<{
    doctorId: z.ZodString;
    scheduledAt: z.ZodString;
    reason: z.ZodString;
    duration: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    doctorId: string;
    scheduledAt: string;
    reason: string;
    duration?: number | undefined;
}, {
    doctorId: string;
    scheduledAt: string;
    reason: string;
    duration?: number | undefined;
}>;
export declare const updateAppointmentSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["SCHEDULED", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]>>;
    notes: z.ZodOptional<z.ZodString>;
    scheduledAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "COMPLETED" | "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "NO_SHOW" | undefined;
    scheduledAt?: string | undefined;
    notes?: string | undefined;
}, {
    status?: "COMPLETED" | "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "NO_SHOW" | undefined;
    scheduledAt?: string | undefined;
    notes?: string | undefined;
}>;
export declare const createMedicalRecordSchema: z.ZodObject<{
    appointmentId: z.ZodString;
    diagnosis: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    treatment: z.ZodOptional<z.ZodString>;
    prescription: z.ZodOptional<z.ZodString>;
    followUpDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    appointmentId: string;
    notes?: string | undefined;
    diagnosis?: string | undefined;
    treatment?: string | undefined;
    prescription?: string | undefined;
    followUpDate?: string | undefined;
}, {
    appointmentId: string;
    notes?: string | undefined;
    diagnosis?: string | undefined;
    treatment?: string | undefined;
    prescription?: string | undefined;
    followUpDate?: string | undefined;
}>;
export declare const updateMedicalRecordSchema: z.ZodObject<{
    diagnosis: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    treatment: z.ZodOptional<z.ZodString>;
    prescription: z.ZodOptional<z.ZodString>;
    followUpDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
    diagnosis?: string | undefined;
    treatment?: string | undefined;
    prescription?: string | undefined;
    followUpDate?: string | null | undefined;
}, {
    notes?: string | undefined;
    diagnosis?: string | undefined;
    treatment?: string | undefined;
    prescription?: string | undefined;
    followUpDate?: string | null | undefined;
}>;
export declare const updatePatientProfileSchema: z.ZodObject<{
    dateOfBirth: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["MALE", "FEMALE", "OTHER"]>>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    bloodGroup: z.ZodOptional<z.ZodString>;
    emergencyContact: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    dateOfBirth?: string | undefined;
    gender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    bloodGroup?: string | undefined;
    emergencyContact?: string | undefined;
}, {
    dateOfBirth?: string | undefined;
    gender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    bloodGroup?: string | undefined;
    emergencyContact?: string | undefined;
}>;
export declare const updateDoctorProfileSchema: z.ZodObject<{
    specialization: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    isAvailable: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    phone?: string | undefined;
    specialization?: string | undefined;
    department?: string | undefined;
    bio?: string | undefined;
    isAvailable?: boolean | undefined;
}, {
    phone?: string | undefined;
    specialization?: string | undefined;
    department?: string | undefined;
    bio?: string | undefined;
    isAvailable?: boolean | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare function parsePagination(query: {
    page?: string;
    limit?: string;
}): {
    page: number;
    limit: number;
};
//# sourceMappingURL=validators.d.ts.map