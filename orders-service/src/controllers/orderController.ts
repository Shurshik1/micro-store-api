import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productName, price, buyerId } = req.body;
    const parsedPrice = Number(price);
    const parsedBuyerId = Number(buyerId);

    if (!productName || price === undefined || buyerId === undefined) {
      throw new AppError('Название, цена и ID покупателя обязательны!', 400);
    }

    if (isNaN(parsedPrice) || isNaN(parsedBuyerId)) {
      throw new AppError('Цена и ID покупателя должны быть числами!', 400);
    }

    const newOrder = await prisma.order.create ({
      data: { productName, price: parsedPrice, buyerId: parsedBuyerId }
    });
  
    res.status(201).json(newOrder);
  } catch (error){
    next(error);
  }
};


export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
try {
    const orderId = parseInt(req.params.id as string, 10);

    if (isNaN(orderId)) {
      throw new AppError('ID заказа должен быть числом!', 400);
    }

    // 1. ДОСТАЕМ ЗАКАЗ ИЗ БАЗЫ
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    // Если Prisma вернула null (заказа нет)
    if (!order) {
      throw new AppError(`Заказ с ID ${orderId} не найден`, 404);
    }

    // 2. ИДЕМ К СОСЕДНЕМУ СЕРВИСУ ЗА ЮЗЕРОМ
    // Обязательно используем обратные кавычки (backticks), чтобы вставить ID покупателя!
    const userResponse = await fetch(`http://users-api:3001/api/users/${order.buyerId}`);
    
    // Если Users API ответил ошибкой (например, такого юзера нет)
    if (!userResponse.ok) {
      throw new AppError(`Покупатель с ID ${order.buyerId} не найден в базе пользователей`, 404);
    }

    // Распаковываем ответ от сервиса юзеров
    const userData = await userResponse.json();

    // 3. СКЛЕИВАЕМ ДАННЫЕ ВМЕСТЕ
    const fullOrder = {
      ...order,      // Берем все поля из заказа (id, productName, price и т.д.)
      buyer: userData // И добавляем сверху объект с данными юзера
    };

    // Отдаем клиенту красивый склеенный результат
    res.json(fullOrder);
    
  } catch (error) {
    next(error);
  }
};