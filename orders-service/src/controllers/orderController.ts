import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import jwt from 'jsonwebtoken';

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


    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });


    if (!order) {
      throw new AppError(`Заказ с ID ${orderId} не найден`, 404);
    }


    const userResponse = await fetch(`http://users-api:3001/api/users/${order.buyerId}`);
    

    if (!userResponse.ok) {
      throw new AppError(`Покупатель с ID ${order.buyerId} не найден в базе пользователей`, 404);
    }


    const userData = await userResponse.json();


    const fullOrder = {
      ...order,      
      buyer: userData 
    };


    res.json(fullOrder);
    
  } catch (error) {
    next(error);
  }
};


export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Нет доступа. Токен не предоставлен', 401);
    }

    const token = authHeader.split(' ')[1];


    const secret = process.env.JWT_SECRET || 'super-secret-key'; 
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      throw new AppError('Неверный или просроченный токен', 401);
    }

 
    const currentBuyerId = decoded.userId; 


    if (!currentBuyerId) {
      throw new AppError('Ошибка структуры токена: нет ID пользователя', 401);
    }

    const orders = await prisma.order.findMany({
      where: { 
        buyerId: Number(currentBuyerId) 
      }
    });

    res.status(200).json(orders);

  } catch (error) {
    next(error);
  }
};