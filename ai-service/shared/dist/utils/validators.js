"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.updateDoctorProfileSchema = exports.updatePatientProfileSchema = exports.updateMedicalRecordSchema = exports.createMedicalRecordSchema = exports.updateAppointmentSchema = exports.createAppointmentSchema = exports.registerSchema = exports.loginSchema = void 0;
exports.parsePagination = parsePagination;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    firstName: zod_1.z.string().min(1, 'First name is required').max(50),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(50),
    role: zod_1.z.enum(['DOCTOR', 'PATIENT']),
});
exports.createAppointmentSchema = zod_1.z.object({
    doctorId: zod_1.z.string().uuid('Invalid doctor ID'),
    scheduledAt: zod_1.z.string().datetime('Invalid date format'),
    reason: zod_1.z.string().min(1, 'Reason is required').max(500),
    duration: zod_1.z.number().int().min(15).max(120).optional(),
});
exports.updateAppointmentSchema = zod_1.z.object({
    status: zod_1.z
        .enum(['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'])
        .optional(),
    notes: zod_1.z.string().max(1000).optional(),
    scheduledAt: zod_1.z.string().datetime().optional(),
});
exports.createMedicalRecordSchema = zod_1.z.object({
    appointmentId: zod_1.z.string().uuid('Invalid appointment ID'),
    diagnosis: zod_1.z.string().max(1000).optional(),
    notes: zod_1.z.string().max(2000).optional(),
    treatment: zod_1.z.string().max(1000).optional(),
    prescription: zod_1.z.string().max(1000).optional(),
    followUpDate: zod_1.z.string().datetime().optional(),
});
exports.updateMedicalRecordSchema = zod_1.z.object({
    diagnosis: zod_1.z.string().max(1000).optional(),
    notes: zod_1.z.string().max(2000).optional(),
    treatment: zod_1.z.string().max(1000).optional(),
    prescription: zod_1.z.string().max(1000).optional(),
    followUpDate: zod_1.z.string().datetime().optional().nullable(),
});
exports.updatePatientProfileSchema = zod_1.z.object({
    dateOfBirth: zod_1.z.string().datetime().optional(),
    gender: zod_1.z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    phone: zod_1.z.string().max(20).optional(),
    address: zod_1.z.string().max(300).optional(),
    bloodGroup: zod_1.z.string().max(5).optional(),
    emergencyContact: zod_1.z.string().max(20).optional(),
});
exports.updateDoctorProfileSchema = zod_1.z.object({
    specialization: zod_1.z.string().min(1).max(100).optional(),
    phone: zod_1.z.string().max(20).optional(),
    department: zod_1.z.string().max(100).optional(),
    bio: zod_1.z.string().max(500).optional(),
    isAvailable: zod_1.z.boolean().optional(),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
});
function parsePagination(query) {
    return exports.paginationSchema.parse(query);
}
//# sourceMappingURL=validators.js.map