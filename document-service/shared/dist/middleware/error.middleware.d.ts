import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    readonly message: string;
    readonly statusCode: number;
    readonly error: string;
    constructor(message: string, statusCode?: number, error?: string);
}
export declare function globalErrorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void;
export declare function notFoundHandler(req: Request, res: Response): void;
//# sourceMappingURL=error.middleware.d.ts.map