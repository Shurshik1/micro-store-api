import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const postUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            throw new AppError('Имя и email обязательны!', 400);
        }

        const newUser = await prisma.user.create({
            data: { name, email }
        });
        res.status(201).json(newUser);
    } catch (error: any) {
        if (error.code === 'P2002') {
          return next(new AppError('Пользователь с таким email уже существует', 409));
        } 
      next(error);
    }};

export const getUserId = async (req: Request, res: Response, next: NextFunction) => {
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
      }};