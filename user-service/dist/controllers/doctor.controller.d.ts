import { Request, Response, NextFunction } from 'express';
export declare function getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAppointments(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getDoctorById(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAllDoctors(req: Request, res: Response, next: NextFunction): Promise<void>;
