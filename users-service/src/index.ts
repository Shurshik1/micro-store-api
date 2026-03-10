import dotenv from 'dotenv';
// Вызываем конфигурацию ДО того, как импортировать всё остальное!
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';

const app = express();
const PORT = 3001;

// Теперь process.env.DATABASE_URL 100% не будет пустым
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
app.use(express.json());

// ... дальше идут роуты app.get, app.post и обработчик ошибок (их не меняем)

// 🟢 РОУТ 1: Получить всех пользователей из базы
app.get('/api/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// 🔵 РОУТ 2: Создать нового пользователя
app.post('/api/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      throw new AppError('Имя и email обязательны!', 400);
    }

    const newUser = await prisma.user.create({
      data: { name, email }
    });
    
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

app.get('/api/users/:id', async (req: Request, res: Response, next: NextFunction) =>{
  try{
    const userId = parseInt(req.params.id as string, 10);
    if (isNaN(userId)) {
      throw new AppError('ID пользователя должен быть числом!', 400);
    }
    const user = await prisma.user.findUnique({
  where: { id: userId }
});
if(!user){
  throw new AppError('Пользователь не найден', 404);
}
res.json(user);
  } catch (error){
    next(error);
  }
});

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Маршрут ${req.originalUrl} не найден`, 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Users Service] Запущен на http://localhost:${PORT}`);
});