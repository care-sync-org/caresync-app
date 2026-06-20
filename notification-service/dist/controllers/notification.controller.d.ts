import { Request, Response, NextFunction } from 'express';
export declare function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function markAllRead(req: Request, res: Response, next: NextFunction): Promise<void>;
