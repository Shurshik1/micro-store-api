import express, { Request } from 'express'; 
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3000;

app.use(cors());

app.use('/api/users', createProxyMiddleware({ 
  target: 'http://users-api:3001',
  changeOrigin: true,
  pathRewrite: (path, req) => (req as Request).originalUrl
}));

app.use('/api/orders', createProxyMiddleware({
    target: 'http://orders-api:3002',
    changeOrigin: true,
    pathRewrite: (path, req) => (req as Request).originalUrl
}));

app.listen(PORT, () => {
  console.log(`[API Gateway] Запущен на http://localhost:${PORT}`);
});