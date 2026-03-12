import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next(); 
    } catch (error: any) {
      if (error instanceof ZodError) {
        // Достаем ошибки безопасно: либо из issues, либо из errors, либо пустой массив
        const issues = error.issues || (error as any).errors || [];
        
        const errorMessages = issues.map((err: any) => {
          return `${err.path.join('.')}: ${err.message}`;
        });

        return res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: 'Ошибка валидации данных',
          errors: errorMessages,
        });
      }
      next(error);
    }
  };
};