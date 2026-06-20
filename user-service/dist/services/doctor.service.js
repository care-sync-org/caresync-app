"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDoctorProfile = getDoctorProfile;
exports.getDoctorById = getDoctorById;
exports.updateDoctorProfile = updateDoctorProfile;
exports.getDoctorAppointments = getDoctorAppointments;
exports.getAllDoctors = getAllDoctors;
exports.getAllDoctorsAdmin = getAllDoctorsAdmin;
const shared_1 = require("@caresync/shared");
async function getDoctorProfile(userId) {
    const doctor = await shared_1.prisma.doctor.findUnique({
        where: { userId },
        include: {
            user: {
                select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
            },
        },
    });
    if (!doctor) {
        throw new shared_1.AppError('Doctor profile not found', 404, 'Not Found');
    }
    return doctor;
}
async function getDoctorById(doctorId) {
    const doctor = await shared_1.prisma.doctor.findUnique({
        where: { id: doctorId },
        include: {
            user: {
                select: { id: true, email: true, firstName: true, lastName: true },
            },
        },
    });
    if (!doctor) {
        throw new shared_1.AppError('Doctor not found', 404, 'Not Found');
    }
    return doctor;
}
async function updateDoctorProfile(userId, body) {
    const data = shared_1.updateDoctorProfileSchema.parse(body);
    const doctor = await shared_1.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
        throw new shared_1.AppError('Doctor profile not found', 404, 'Not Found');
    }
    const updated = await shared_1.prisma.doctor.update({
        where: { userId },
        data,
        include: {
            user: {
                select: { id: true, email: true, firstName: true, lastName: true },
            },
        },
    });
    await (0, shared_1.createAuditLog)({
        userId,
        action: 'UPDATE',
        resource: 'doctors',
        resourceId: doctor.id,
    });
    return updated;
}
async function getDoctorAppointments(userId, query) {
    const doctor = await shared_1.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
        throw new shared_1.AppError('Doctor not found', 404, 'Not Found');
    }
    const { page, limit } = (0, shared_1.parsePagination)(query);
    const skip = (page - 1) * limit;
    const where = { doctorId: doctor.id };
    if (query.status) {
        where.status = query.status;
    }
    const [appointments, total] = await Promise.all([
        shared_1.prisma.appointment.findMany({
            where,
            include: {
                patient: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                documents: {
                                    select: {
                                        id: true,
                                        originalName: true,
                                        mimeType: true,
                                        size: true,
                                        uploadedAt: true,
                                        aiSummary: true,
                                        aiSummaryStatus: true
                                    },
                                    orderBy: { uploadedAt: 'desc' }
                                }
                            }
                        }
                    }
                },
                medicalRecord: true,
            },
            orderBy: { scheduledAt: 'asc' },
            skip,
            take: limit,
        }),
        shared_1.prisma.appointment.count({ where }),
    ]);
    return {
        data: appointments,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
}
async function getAllDoctors(query) {
    const { page, limit } = (0, shared_1.parsePagination)(query);
    const skip = (page - 1) * limit;
    const [doctors, total] = await Promise.all([
        shared_1.prisma.doctor.findMany({
            include: {
                user: {
                    select: { id: true, email: true, firstName: true, lastName: true, isActive: true },
                },
            },
            where: { isAvailable: true },
            skip,
            take: limit,
            orderBy: { specialization: 'asc' },
        }),
        shared_1.prisma.doctor.count({ where: { isAvailable: true } }),
    ]);
    return {
        data: doctors,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
}
async function getAllDoctorsAdmin(query) {
    const { page, limit } = (0, shared_1.parsePagination)(query);
    const skip = (page - 1) * limit;
    const [doctors, total] = await Promise.all([
        shared_1.prisma.doctor.findMany({
            include: {
                user: {
                    select: { id: true, email: true, firstName: true, lastName: true, isActive: true, createdAt: true },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        shared_1.prisma.doctor.count(),
    ]);
    return {
        data: doctors,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
}
//# sourceMappingURL=doctor.service.js.map