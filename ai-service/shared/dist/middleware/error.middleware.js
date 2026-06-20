"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.globalErrorHandler = globalErrorHandler;
exports.notFoundHandler = notFoundHandler;
const zod_1 = require("zod");
class AppError extends Error {
    constructor(message, statusCode = 500, error = 'Internal Server Error') {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.error = error;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
function globalErrorHandler(err, req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            error: 'Validation Error',
            message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
            statusCode: 400,
        });
        return;
    }
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.error,
            message: err.message,
            statusCode: err.statusCode,
        });
        return;
    }
    if (process.env.NODE_ENV !== 'production') {
        console.error(err);
    }
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: 500,
    });
}
function notFoundHandler(req, res) {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        statusCode: 404,
    });
}
//# sourceMappingURL=error.middleware.js.map