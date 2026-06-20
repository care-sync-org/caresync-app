"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointment = createAppointment;
exports.updateAppointment = updateAppointment;
exports.getAppointmentById = getAppointmentById;
exports.getAllAppointments = getAllAppointments;
const shared_1 = require("@caresync/shared");
async function createAppointment(userId, body, notificationProvider, eventProvider) {
    const data = shared_1.createAppointmentSchema.parse(body);
    const patient = await shared_1.prisma.patient.findUnique({ where: { userId } });
    if (!patient) {
        throw new shared_1.AppError('Patient profile not found', 404, 'Not Found');
    }
    const doctor = await shared_1.prisma.doctor.findUnique({
        where: { id: data.doctorId },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!doctor || !doctor.isAvailable) {
        throw new shared_1.AppError('Doctor not found or unavailable', 404, 'Not Found');
    }
    const scheduledAt = new Date(data.scheduledAt);
    if (scheduledAt <= new Date()) {
        throw new shared_1.AppError('Appointment must be scheduled in the future', 400, 'Bad Request');
    }
    const conflict = await shared_1.prisma.appointment.findFirst({
        where: {
            doctorId: data.doctorId,
            scheduledAt,
            status: { notIn: ['CANCELLED'] },
        },
    });
    if (conflict) {
        throw new shared_1.AppError('Doctor already has an appointment at this time', 409, 'Conflict');
    }
    const appointment = await shared_1.prisma.appointment.create({
        data: {
            patientId: patient.id,
            doctorId: data.doctorId,
            scheduledAt,
            reason: data.reason,
            duration: data.duration ?? 30,
        },
        include: {
            doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
            patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
    });
    const doctorName = `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`;
    await notificationProvider.sendBulk([
        {
            userId,
            type: 'APPOINTMENT_CREATED',
            title: 'Appointment Scheduled',
            message: `Your appointment with ${doctorName} is scheduled for ${scheduledAt.toLocaleDateString()}.`,
        },
        {
            userId: doctor.user.id,
            type: 'APPOINTMENT_CREATED',
            title: 'New Appointment',
            message: `New appointment with ${appointment.patient.user.firstName} ${appointment.patient.user.lastName} scheduled for ${scheduledAt.toLocaleDateString()}.`,
        },
    ]);
    await eventProvider.publish({
        source: 'caresync.appointments',
        detailType: 'AppointmentCreated',
        detail: { appointmentId: appointment.id, patientId: patient.id, doctorId: data.doctorId },
    });
    await (0, shared_1.createAuditLog)({
        userId,
        action: 'CREATE',
        resource: 'appointments',
        resourceId: appointment.id,
    });
    return appointment;
}
async function updateAppointment(appointmentId, userId, role, body, notificationProvider, eventProvider) {
    const data = shared_1.updateAppointmentSchema.parse(body);
    const appointment = await shared_1.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            patient: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
            doctor: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        },
    });
    if (!appointment) {
        throw new shared_1.AppError('Appointment not found', 404, 'Not Found');
    }
    if (role === 'PATIENT') {
        const patient = await shared_1.prisma.patient.findUnique({ where: { userId } });
        if (appointment.patientId !== patient?.id) {
            throw new shared_1.AppError('You can only update your own appointments', 403, 'Forbidden');
        }
        if (data.status && !['CANCELLED'].includes(data.status)) {
            throw new shared_1.AppError('Patients can only cancel appointments', 403, 'Forbidden');
        }
    }
    if (role === 'DOCTOR') {
        const doctor = await shared_1.prisma.doctor.findUnique({ where: { userId } });
        if (appointment.doctorId !== doctor?.id) {
            throw new shared_1.AppError('You can only update your own appointments', 403, 'Forbidden');
        }
    }
    const updated = await shared_1.prisma.appointment.update({
        where: { id: appointmentId },
        data: {
            ...(data.status && { status: data.status }),
            ...(data.notes !== undefined && { notes: data.notes }),
            ...(data.scheduledAt && { scheduledAt: new Date(data.scheduledAt) }),
        },
        include: {
            patient: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
            doctor: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        },
    });
    if (data.status) {
        const typeMap = {
            CANCELLED: 'APPOINTMENT_CANCELLED',
            CONFIRMED: 'APPOINTMENT_CONFIRMED',
            COMPLETED: 'APPOINTMENT_COMPLETED',
        };
        const notifType = typeMap[data.status];
        if (notifType) {
            await notificationProvider.sendBulk([
                {
                    userId: updated.patient.user.id,
                    type: notifType,
                    title: `Appointment ${data.status.charAt(0) + data.status.slice(1).toLowerCase()}`,
                    message: `Your appointment has been ${data.status.toLowerCase()}.`,
                },
                {
                    userId: updated.doctor.user.id,
                    type: notifType,
                    title: `Appointment ${data.status.charAt(0) + data.status.slice(1).toLowerCase()}`,
                    message: `Appointment with ${updated.patient.user.firstName} ${updated.patient.user.lastName} has been ${data.status.toLowerCase()}.`,
                },
            ]);
        }
        await eventProvider.publish({
            source: 'caresync.appointments',
            detailType: `Appointment${data.status.charAt(0) + data.status.slice(1).toLowerCase()}`,
            detail: { appointmentId },
        });
    }
    await (0, shared_1.createAuditLog)({
        userId,
        action: 'UPDATE',
        resource: 'appointments',
        resourceId: appointmentId,
        details: data,
    });
    return updated;
}
async function getAppointmentById(appointmentId) {
    const appointment = await shared_1.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            patient: {
                include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
            },
            doctor: {
                include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
            },
            medicalRecord: true,
            documents: true,
        },
    });
    if (!appointment) {
        throw new shared_1.AppError('Appointment not found', 404, 'Not Found');
    }
    return appointment;
}
async function getAllAppointments(query) {
    const { page, limit } = (0, shared_1.parsePagination)(query);
    const skip = (page - 1) * limit;
    const where = {};
    if (query.status) {
        where.status = query.status;
    }
    const [appointments, total] = await Promise.all([
        shared_1.prisma.appointment.findMany({
            where,
            include: {
                patient: {
                    include: { user: { select: { firstName: true, lastName: true, email: true } } },
                },
                doctor: {
                    include: { user: { select: { firstName: true, lastName: true } } },
                },
            },
            orderBy: { scheduledAt: 'desc' },
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
//# sourceMappingURL=appointment.service.js.map