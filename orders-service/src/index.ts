import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();


import express, { Request, Response, NextFunction } from 'express';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';
import { createOrder, getOrderById } from './controllers/orderController';

const app = express();
// Этот сервер живет на порту 3002!
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Главная фишка микросервисов: идем за данными на другой сервер
// Получение заказа из базы + подтягивание юзера по сети
app.get('/api/orders/:id', getOrderById);

app.post('/api/orders', createOrder);

// Перехватчик 404
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Маршрут ${req.originalUrl} не найден на сервере Orders API`, 404));
});

// Глобальный перехватчик ошибок
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Orders Service] Запущен на http://localhost:${PORT}`);
});