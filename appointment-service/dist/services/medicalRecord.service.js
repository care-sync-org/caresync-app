"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMedicalRecord = createMedicalRecord;
exports.updateMedicalRecord = updateMedicalRecord;
exports.getMedicalRecordById = getMedicalRecordById;
exports.getPatientMedicalRecords = getPatientMedicalRecords;
const shared_1 = require("@caresync/shared");
async function createMedicalRecord(userId, body, notificationProvider) {
    const data = shared_1.createMedicalRecordSchema.parse(body);
    const doctor = await shared_1.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
        throw new shared_1.AppError('Doctor profile not found', 404, 'Not Found');
    }
    const appointment = await shared_1.prisma.appointment.findUnique({
        where: { id: data.appointmentId },
        include: {
            patient: { include: { user: { select: { id: true } } } },
        },
    });
    if (!appointment) {
        throw new shared_1.AppError('Appointment not found', 404, 'Not Found');
    }
    if (appointment.doctorId !== doctor.id) {
        throw new shared_1.AppError('You can only add records for your own appointments', 403, 'Forbidden');
    }
    const existing = await shared_1.prisma.medicalRecord.findUnique({
        where: { appointmentId: data.appointmentId },
    });
    if (existing) {
        throw new shared_1.AppError('Medical record already exists for this appointment', 409, 'Conflict');
    }
    const record = await shared_1.prisma.medicalRecord.create({
        data: {
            appointmentId: data.appointmentId,
            patientId: appointment.patientId,
            doctorId: doctor.id,
            diagnosis: data.diagnosis,
            notes: data.notes,
            treatment: data.treatment,
            prescription: data.prescription,
            followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
        },
    });
    await notificationProvider.send({
        userId: appointment.patient.user.id,
        type: 'RECORD_ADDED',
        title: 'Medical Record Added',
        message: 'Your doctor has added a medical record for your recent appointment.',
    });
    await (0, shared_1.createAuditLog)({
        userId,
        action: 'CREATE',
        resource: 'medical_records',
        resourceId: record.id,
    });
    return record;
}
async function updateMedicalRecord(recordId, userId, body) {
    const data = shared_1.updateMedicalRecordSchema.parse(body);
    const doctor = await shared_1.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
        throw new shared_1.AppError('Doctor profile not found', 404, 'Not Found');
    }
    const record = await shared_1.prisma.medicalRecord.findUnique({ where: { id: recordId } });
    if (!record) {
        throw new shared_1.AppError('Medical record not found', 404, 'Not Found');
    }
    if (record.doctorId !== doctor.id) {
        throw new shared_1.AppError('You can only update your own medical records', 403, 'Forbidden');
    }
    const updated = await shared_1.prisma.medicalRecord.update({
        where: { id: recordId },
        data: {
            ...(data.diagnosis !== undefined && { diagnosis: data.diagnosis }),
            ...(data.notes !== undefined && { notes: data.notes }),
            ...(data.treatment !== undefined && { treatment: data.treatment }),
            ...(data.prescription !== undefined && { prescription: data.prescription }),
            ...(data.followUpDate !== undefined && {
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
            }),
        },
    });
    await (0, shared_1.createAuditLog)({
        userId,
        action: 'UPDATE',
        resource: 'medical_records',
        resourceId: recordId,
    });
    return updated;
}
async function getMedicalRecordById(recordId) {
    const record = await shared_1.prisma.medicalRecord.findUnique({
        where: { id: recordId },
        include: {
            appointment: true,
            patient: {
                include: { user: { select: { firstName: true, lastName: true, email: true } } },
            },
            doctor: {
                include: { user: { select: { firstName: true, lastName: true } } },
            },
            documents: true,
        },
    });
    if (!record) {
        throw new shared_1.AppError('Medical record not found', 404, 'Not Found');
    }
    return record;
}
async function getPatientMedicalRecords(userId, query) {
    const patient = await shared_1.prisma.patient.findUnique({ where: { userId } });
    if (!patient) {
        throw new shared_1.AppError('Patient not found', 404, 'Not Found');
    }
    const { page, limit } = (0, shared_1.parsePagination)(query);
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
        shared_1.prisma.medicalRecord.findMany({
            where: { patientId: patient.id },
            include: {
                doctor: {
                    include: { user: { select: { firstName: true, lastName: true } } },
                },
                appointment: { select: { scheduledAt: true, reason: true } },
                documents: true,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        shared_1.prisma.medicalRecord.count({ where: { patientId: patient.id } }),
    ]);
    return {
        data: records,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
}
//# sourceMappingURL=medicalRecord.service.js.map