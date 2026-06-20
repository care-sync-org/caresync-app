import { Request, Response, NextFunction } from 'express';
export declare function upload(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function download(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function remove(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getMyDocuments(req: Request, res: Response, next: NextFunction): Promise<void>;
