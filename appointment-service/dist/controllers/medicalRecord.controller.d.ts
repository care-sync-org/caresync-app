import { Request, Response, NextFunction } from 'express';
export declare function createRecord(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateRecord(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getRecord(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getMyRecords(req: Request, res: Response, next: NextFunction): Promise<void>;
