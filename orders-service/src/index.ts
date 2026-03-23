import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();


import express, { Request, Response, NextFunction } from 'express';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';
import { createOrder, getOrderById, getUserOrders } from './controllers/orderController';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.get('/api/orders', getUserOrders);
app.get('/api/orders/:id', getOrderById);
app.post('/api/orders', createOrder);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Маршрут ${req.originalUrl} не найден на сервере Orders API`, 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Orders Service] Запущен на http://localhost:${PORT}`);
});