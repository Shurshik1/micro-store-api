import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // По умолчанию ставим статус 500 (Неизвестная ошибка сервера)
  let statusCode = 500;
  let message = 'Что-то пошло не так на сервере';

  // Если это наша кастомная ошибка, берем данные из неё
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Логируем ошибку в терминал (для нас)
  console.error(`[ERROR] ${statusCode} - ${message}`);
  
  // А вот это покажет нам РЕАЛЬНУЮ системную ошибку в терминале!
  if (!(err instanceof AppError)) {
    console.error(`[🔥 ДЕТАЛИ ОШИБКИ]:`, err);
  }

  // Отправляем красивый JSON клиенту (для фронтенда)
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
};