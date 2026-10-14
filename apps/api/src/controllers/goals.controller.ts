import type { NextFunction, Request, Response } from 'express';

import { GoalsService } from '../services/goals.service';
import type {
  CreateGoalBody,
  UpdateGoalBody,
} from '../validators/goals.validator';

export class GoalsController {
  private service = new GoalsService();

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const goals = await this.service.getAll(userId);
      res.json(goals);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const goal = await this.service.create(
        req.body as CreateGoalBody,
        userId,
      );
      res.status(201).json(goal);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const goal = await this.service.update(
        id,
        req.body as UpdateGoalBody,
        userId,
      );
      res.json(goal);
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
