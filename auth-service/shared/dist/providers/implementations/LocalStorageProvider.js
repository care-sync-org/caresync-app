"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageProvider = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
class LocalStorageProvider {
    constructor(uploadsDir, baseUrl) {
        this.uploadsDir = uploadsDir;
        this.baseUrl = baseUrl;
    }
    async uploadFile(buffer, originalName, mimeType, folder = 'uploads') {
        const ext = path_1.default.extname(originalName);
        const filename = `${(0, uuid_1.v4)()}${ext}`;
        const key = `${folder}/${filename}`;
        const fullPath = path_1.default.join(this.uploadsDir, folder, filename);
        await promises_1.default.mkdir(path_1.default.dirname(fullPath), { recursive: true });
        await promises_1.default.writeFile(fullPath, buffer);
        return {
            key,
            filename,
            originalName,
            mimeType,
            size: buffer.length,
            url: `${this.baseUrl}/files/${key}`,
        };
    }
    async downloadFile(key) {
        const fullPath = path_1.default.join(this.uploadsDir, key);
        return promises_1.default.readFile(fullPath);
    }
    async deleteFile(key) {
        const fullPath = path_1.default.join(this.uploadsDir, key);
        await promises_1.default.unlink(fullPath).catch(() => { });
    }
    async getFileUrl(key) {
        return `${this.baseUrl}/files/${key}`;
    }
    async fileExists(key) {
        const fullPath = path_1.default.join(this.uploadsDir, key);
        return promises_1.default
            .access(fullPath)
            .then(() => true)
            .catch(() => false);
    }
}
exports.LocalStorageProvider = LocalStorageProvider;
//# sourceMappingURL=LocalStorageProvider.js.map