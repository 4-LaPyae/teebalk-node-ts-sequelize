import { NextFunction, Request, Response } from 'express';

export const setVersionMiddleware = (version: string) => (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('app-version', version);
  next();
};
