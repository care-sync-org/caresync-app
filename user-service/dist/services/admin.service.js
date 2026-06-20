"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
exports.getAllUsers = getAllUsers;
exports.toggleUserStatus = toggleUserStatus;
exports.createDoctor = createDoctor;
exports.getAuditLogs = getAuditLogs;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const shared_1 = require("@caresync/shared");
async function getDashboardStats() {
    const [totalUsers, totalPatients, totalDoctors, totalAppointments, recentAuditLogs] = await Promise.all([
        shared_1.prisma.user.count(),
        shared_1.prisma.patient.count(),
        shared_1.prisma.doctor.count(),
        shared_1.prisma.appointment.count(),
        shared_1.prisma.auditLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { firstName: true, lastName: true, email: true } } },
        }),
    ]);
    const appointmentsByStatus = await shared_1.prisma.appointment.groupBy({
        by: ['status'],
        _count: true,
    });
    return {
        stats: { totalUsers, totalPatients, totalDoctors, totalAppointments },
        appointmentsByStatus: appointmentsByStatus.map((a) => ({
            status: a.status,
            count: a._count,
        })),
        recentActivity: recentAuditLogs,
    };
}
async function getAllUsers(query) {
    const { page, limit } = (0, shared_1.parsePagination)(query);
    const skip = (page - 1) * limit;
    const where = {};
    if (query.role) {
        where.role = query.role;
    }
    const [users, total] = await Promise.all([
        shared_1.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
                isActive: true,
                createdAt: true,
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        shared_1.prisma.user.count({ where }),
    ]);
    return {
        data: users,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
}
async function toggleUserStatus(targetUserId, adminUserId) {
    const user = await shared_1.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
        throw new shared_1.AppError('User not found', 404, 'Not Found');
    }
    if (user.role === 'ADMIN') {
        throw new shared_1.AppError('Cannot deactivate admin accounts', 403, 'Forbidden');
    }
    const updated = await shared_1.prisma.user.update({
        where: { id: targetUserId },
        data: { isActive: !user.isActive },
        select: { id: true, email: true, isActive: true },
    });
    await (0, shared_1.createAuditLog)({
        userId: adminUserId,
        action: updated.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        resource: 'users',
        resourceId: targetUserId,
    });
    return updated;
}
const createDoctorSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    specialization: zod_1.z.string().min(1),
    licenseNumber: zod_1.z.string().min(1),
    phone: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
});
async function createDoctor(body, adminUserId) {
    const data = createDoctorSchema.parse(body);
    const existing = await shared_1.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
        throw new shared_1.AppError('Email already registered', 409, 'Conflict');
    }
    const existingLicense = await shared_1.prisma.doctor.findUnique({
        where: { licenseNumber: data.licenseNumber },
    });
    if (existingLicense) {
        throw new shared_1.AppError('License number already registered', 409, 'Conflict');
    }
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
    const user = await shared_1.prisma.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            role: client_1.Role.DOCTOR,
            firstName: data.firstName,
            lastName: data.lastName,
        },
    });
    const doctor = await shared_1.prisma.doctor.create({
        data: {
            userId: user.id,
            specialization: data.specialization,
            licenseNumber: data.licenseNumber,
            phone: data.phone,
            department: data.department,
        },
        include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
    });
    await (0, shared_1.createAuditLog)({
        userId: adminUserId,
        action: 'CREATE',
        resource: 'doctors',
        resourceId: doctor.id,
        details: { email: data.email, licenseNumber: data.licenseNumber },
    });
    return doctor;
}
async function getAuditLogs(query) {
    const { page, limit } = (0, shared_1.parsePagination)(query);
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
        shared_1.prisma.auditLog.findMany({
            include: {
                user: { select: { firstName: true, lastName: true, email: true, role: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        shared_1.prisma.auditLog.count(),
    ]);
    return {
        data: logs,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
}
//# sourceMappingURL=admin.service.js.map