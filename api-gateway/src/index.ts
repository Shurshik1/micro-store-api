import express, { Request } from 'express'; // <-- Добавили Request сюда
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3000;

app.use(cors());

// 🟢 Правило 1: Юзеры
app.use('/api/users', createProxyMiddleware({ 
  target: 'http://users-api:3001',
  changeOrigin: true,
  // Подсказываем TS, что req — это именно запрос Express
  pathRewrite: (path, req) => (req as Request).originalUrl
}));

// 🔵 Правило 2: Заказы
app.use('/api/orders', createProxyMiddleware({
    target: 'http://orders-api:3002',
    changeOrigin: true,
    // Делаем то же самое здесь
    pathRewrite: (path, req) => (req as Request).originalUrl
}));

app.listen(PORT, () => {
  console.log(`[API Gateway] Запущен на http://localhost:${PORT}`);
});