import { Request, Response, NextFunction } from 'express';
export declare function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createDoctor(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
