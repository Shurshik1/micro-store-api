import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';
import { getAllUsers, postUser, getUserId } from './controllers/userController';

const app = express();
const PORT = 3001;


app.use(cors());
app.use(express.json());


// ... дальше идут роуты app.get, app.post и обработчик ошибок (их не меняем)

// 🟢 РОУТ 1: Получить всех пользователей из базы
app.get('/api/users', getAllUsers);

// 🔵 РОУТ 2: Создать нового пользователя
app.post('/api/users', postUser);

app.get('/api/users/:id', getUserId);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Маршрут ${req.originalUrl} не найден`, 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Users Service] Запущен на http://localhost:${PORT}`);
});