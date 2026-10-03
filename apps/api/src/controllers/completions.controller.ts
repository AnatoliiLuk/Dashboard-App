import type { NextFunction, Request, Response } from 'express';

import { CompletionsService } from '../services/completions.service';

export class CompletionsController {
  private service = new CompletionsService();

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const completions = await this.service.getAll(userId);
      res.json(completions);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { habitId, date } = req.body as {
        habitId: string;
        date: string;
      };
      const userId = req.user!.id;
      const completion = await this.service.create(habitId, date, userId);
      res.status(201).json(completion);
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

  toggle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { habitId, date } = req.body as {
        habitId: string;
        date: string;
      };
      const userId = req.user!.id;
      const result = await this.service.toggle(habitId, date, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
