import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const postUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return next(new AppError('Пользователь с таким email уже существует', 409));
    }
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Неверный email или пароль', 401);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError('Неверный email или пароль', 401);
    }

    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET || 'super-secret-key', 
      { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      status: 'success',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

export const getUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id as string, 10);
    if (isNaN(userId)) {
      throw new AppError('ID пользователя должен быть числом!', 400);
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });
    if (!user) {
      throw new AppError('Пользователь не найден', 404);
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};