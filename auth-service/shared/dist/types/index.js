"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_FILE_SIZE = exports.ALLOWED_MIME_TYPES = void 0;
exports.ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
];
exports.MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB ?? '10') * 1024 * 1024;
//# sourceMappingURL=index.js.map