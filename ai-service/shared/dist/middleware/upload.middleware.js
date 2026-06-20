"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleMiddleware = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const error_middleware_1 = require("./error.middleware");
const types_1 = require("../types");
const storage = multer_1.default.memoryStorage();
function fileFilter(_req, file, cb) {
    if (types_1.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new error_middleware_1.AppError(`File type '${file.mimetype}' is not allowed. Allowed types: PDF, images, Word documents`, 400, 'Bad Request'));
    }
}
exports.uploadMiddleware = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: types_1.MAX_FILE_SIZE,
        files: 5,
    },
}).single('file');
exports.uploadMultipleMiddleware = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: types_1.MAX_FILE_SIZE,
        files: 5,
    },
}).array('files', 5);
//# sourceMappingURL=upload.middleware.js.map