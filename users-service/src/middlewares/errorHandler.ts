import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  let statusCode = 500;
  let message = 'Что-то пошло не так на сервере';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  console.error(`[ERROR] ${statusCode} - ${message}`);
  
  if (!(err instanceof AppError)) {
    console.error(`[🔥 ДЕТАЛИ ОШИБКИ]:`, err);
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
};