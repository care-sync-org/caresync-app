import { Request, Response, NextFunction } from 'express';
export declare function login(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function register(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function logout(_req: Request, res: Response): Promise<void>;
export declare function getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
