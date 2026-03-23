import dotenv from 'dotenv';
import cors from 'cors';
import { z } from 'zod';
import { validate } from './middlewares/validate';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import { getAllUsers, postUser, getUserId, loginUser } from './controllers/userController';

import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const userSchema = z.object({
  name: z.string().min(2, 'Имя слишком короткое'),
  email: z.string().email('Неверный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

const loginSchema = z.object({
  email: z.string().email('Некорректный формат email'),
  password: z.string().min(1, 'Пароль обязателен'),
});

app.get('/api/users', getAllUsers);
app.post('/api/users', validate(userSchema), postUser);
app.get('/api/users/:id', getUserId);

app.post('/api/users/login', validate(loginSchema), loginUser);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Маршрут ${req.originalUrl} не найден`, 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Users Service] Запущен на http://localhost:${PORT}`);
});