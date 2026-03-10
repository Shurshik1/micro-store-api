export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message); // Передаем сообщение родительскому классу Error
    this.statusCode = statusCode;
    
    // Делаем так, чтобы в консоли путь к ошибке был чистым и понятным
    Error.captureStackTrace(this, this.constructor);
  }
}