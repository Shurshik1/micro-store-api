import dotenv from 'dotenv';
import cors from 'cors';
import { z } from 'zod';
import { validate } from './middlewares/validate';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
// 1. Добавляем loginUser в импорт из контроллера
import { getAllUsers, postUser, getUserId, loginUser } from './controllers/userController';

import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';

const app = express();
const PORT = 3001;

// 🟢 БАЗОВЫЕ НАСТРОЙКИ
app.use(cors());
app.use(express.json());

// 🟢 СХЕМЫ ВАЛИДАЦИИ (Объявляем ПЕРЕД роутами)
const userSchema = z.object({
  name: z.string().min(2, 'Имя слишком короткое'),
  email: z.string().email('Неверный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

const loginSchema = z.object({
  email: z.string().email('Некорректный формат email'),
  password: z.string().min(1, 'Пароль обязателен'),
});

// 🟢 РОУТЫ
app.get('/api/users', getAllUsers);
app.post('/api/users', validate(userSchema), postUser);
app.get('/api/users/:id', getUserId);

// Теперь loginSchema и loginUser определены и импортированы!
app.post('/api/users/login', validate(loginSchema), loginUser);

// 🟢 ОБРАБОТЧИКИ ОШИБОК
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Маршрут ${req.originalUrl} не найден`, 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Users Service] Запущен на http://localhost:${PORT}`);
});