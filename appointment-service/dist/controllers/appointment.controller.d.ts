import { Request, Response, NextFunction } from 'express';
export declare function createAppointment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateAppointment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAppointment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAllAppointments(req: Request, res: Response, next: NextFunction): Promise<void>;
