"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientProfile = getPatientProfile;
exports.getPatientById = getPatientById;
exports.updatePatientProfile = updatePatientProfile;
exports.getPatientAppointments = getPatientAppointments;
exports.getAllPatients = getAllPatients;
const shared_1 = require("@caresync/shared");
async function getPatientProfile(userId) {
    const patient = await shared_1.prisma.patient.findUnique({
        where: { userId },
        include: {
            user: {
                select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
            },
        },
    });
    if (!patient) {
        throw new shared_1.AppError('Patient profile not found', 404, 'Not Found');
    }
    return patient;
}
async function getPatientById(patientId) {
    const patient = await shared_1.prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            user: {
                select: { id: true, email: true, firstName: true, lastName: true },
            },
        },
    });
    if (!patient) {
        throw new shared_1.AppError('Patient not found', 404, 'Not Found');
    }
    return patient;
}
async function updatePatientProfile(userId, body) {
    const data = shared_1.updatePatientProfileSchema.parse(body);
    const patient = await shared_1.prisma.patient.findUnique({ where: { userId } });
    if (!patient) {
        throw new shared_1.AppError('Patient profile not found', 404, 'Not Found');
    }
    const updated = await shared_1.prisma.patient.update({
        where: { userId },
        data: {
            ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
            ...(data.gender && { gender: data.gender }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.address !== undefined && { address: data.address }),
            ...(data.bloodGroup !== undefined && { bloodGroup: data.bloodGroup }),
            ...(data.emergencyContact !== undefined && { emergencyContact: data.emergencyContact }),
        },
        include: {
            user: {
                select: { id: true, email: true, firstName: true, lastName: true },
            },
        },
    });
    await (0, shared_1.createAuditLog)({
        userId,
        action: 'UPDATE',
        resource: 'patients',
        resourceId: patient.id,
    });
    return updated;
}
async function getPatientAppointments(userId, query) {
    const patient = await shared_1.prisma.patient.findUnique({ where: { userId } });
    if (!patient) {
        throw new shared_1.AppError('Patient not found', 404, 'Not Found');
    }
    const { page, limit } = (0, shared_1.parsePagination)(query);
    const skip = (page - 1) * limit;
    const [appointments, total] = await Promise.all([
        shared_1.prisma.appointment.findMany({
            where: { patientId: patient.id },
            include: {
                doctor: {
                    include: { user: { select: { firstName: true, lastName: true, email: true } } },
                },
                medicalRecord: true,
            },
            orderBy: { scheduledAt: 'desc' },
            skip,
            take: limit,
        }),
        shared_1.prisma.appointment.count({ where: { patientId: patient.id } }),
    ]);
    return {
        data: appointments,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
}
async function getAllPatients(query) {
    const { page, limit } = (0, shared_1.parsePagination)(query);
    const skip = (page - 1) * limit;
    const [patients, total] = await Promise.all([
        shared_1.prisma.patient.findMany({
            include: {
                user: {
                    select: { id: true, email: true, firstName: true, lastName: true, isActive: true, createdAt: true },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        shared_1.prisma.patient.count(),
    ]);
    return {
        data: patients,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
}
//# sourceMappingURL=patient.service.js.map