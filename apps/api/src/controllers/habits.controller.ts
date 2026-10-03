import type { HabitColor } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

import { HabitsService } from '../services/habits.service';

export class HabitsController {
  private service = new HabitsService();

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const habits = await this.service.getAll(userId);
      res.json(habits);
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const habit = await this.service.getOne(id, userId);
      res.json(habit);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, color } = req.body as {
        name: string;
        color: HabitColor;
      };
      const userId = req.user!.id;
      const habit = await this.service.create(name, color, userId);
      res.status(201).json(habit);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const habit = await this.service.update(
        id,
        req.body as { name?: string; color?: HabitColor },
        userId,
      );
      res.json(habit);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      await this.service.delete(id, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
