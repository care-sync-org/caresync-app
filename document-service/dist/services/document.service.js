"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDocument = uploadDocument;
exports.downloadDocument = downloadDocument;
exports.deleteDocument = deleteDocument;
exports.getUserDocuments = getUserDocuments;
exports.getDocumentUrl = getDocumentUrl;
const shared_1 = require("@caresync/shared");
async function uploadDocument(userId, file, body, storageProvider, notificationProvider) {
    const uploaded = await storageProvider.uploadFile(file.buffer, file.originalname, file.mimetype, 'documents');
    const document = await shared_1.prisma.document.create({
        data: {
            userId,
            appointmentId: body.appointmentId ?? null,
            medicalRecordId: body.medicalRecordId ?? null,
            filename: uploaded.filename,
            originalName: uploaded.originalName,
            mimeType: uploaded.mimeType,
            size: uploaded.size,
            storageKey: uploaded.key,
        },
    });
    await notificationProvider.send({
        userId,
        type: 'DOCUMENT_UPLOADED',
        title: 'Document Uploaded',
        message: `Document "${file.originalname}" has been uploaded successfully.`,
    });
    await (0, shared_1.createAuditLog)({
        userId,
        action: 'UPLOAD',
        resource: 'documents',
        resourceId: document.id,
        details: { filename: file.originalname, size: file.size },
    });
    // Trigger AI summarization mock queue dispatch
    const queueProvider = (0, shared_1.createQueueProvider)();
    if (document.mimeType === 'application/pdf' || document.mimeType === 'text/plain') {
        queueProvider.enqueue('ai-summary', { documentId: document.id }).catch((err) => {
            console.error('[document-service] Failed to enqueue AI summarization task:', err);
        });
    }
    else {
        // Unsupported formats are marked FAILED immediately with a message
        await shared_1.prisma.document.update({
            where: { id: document.id },
            data: {
                aiSummaryStatus: 'FAILED',
                aiSummary: 'AI summary is only supported for PDF and text reports.',
            },
        }).catch((err) => {
            console.error('[document-service] Failed to update unsupported document summary status:', err);
        });
    }
    return { ...document, url: uploaded.url };
}
async function downloadDocument(documentId, userId, role, storageProvider) {
    const document = await shared_1.prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
        throw new shared_1.AppError('Document not found', 404, 'Not Found');
    }
    if (role === 'PATIENT' && document.userId !== userId) {
        throw new shared_1.AppError('Access denied', 403, 'Forbidden');
    }
    const buffer = await storageProvider.downloadFile(document.storageKey);
    return { buffer, document: { mimeType: document.mimeType, originalName: document.originalName } };
}
async function deleteDocument(documentId, userId, role, storageProvider) {
    const document = await shared_1.prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
        throw new shared_1.AppError('Document not found', 404, 'Not Found');
    }
    if (role !== 'ADMIN' && document.userId !== userId) {
        throw new shared_1.AppError('Access denied', 403, 'Forbidden');
    }
    await storageProvider.deleteFile(document.storageKey);
    await shared_1.prisma.document.delete({ where: { id: documentId } });
    await (0, shared_1.createAuditLog)({
        userId,
        action: 'DELETE',
        resource: 'documents',
        resourceId: documentId,
    });
}
async function getUserDocuments(userId, query) {
    const { page, limit } = (0, shared_1.parsePagination)(query);
    const skip = (page - 1) * limit;
    const [documents, total] = await Promise.all([
        shared_1.prisma.document.findMany({
            where: { userId },
            orderBy: { uploadedAt: 'desc' },
            skip,
            take: limit,
        }),
        shared_1.prisma.document.count({ where: { userId } }),
    ]);
    return {
        data: documents,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
}
async function getDocumentUrl(documentId, storageProvider) {
    const document = await shared_1.prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
        throw new shared_1.AppError('Document not found', 404, 'Not Found');
    }
    return storageProvider.getFileUrl(document.storageKey);
}
//# sourceMappingURL=document.service.js.map