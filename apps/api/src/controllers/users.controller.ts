import type { NextFunction, Request, Response } from 'express';

import { UsersRepository } from '../repositories/users.repository';
import { UsersService } from '../services/users.service';
import type { UpdateProfileBody } from '../validators/users.validator';

export class UsersController {
  private service = new UsersService(new UsersRepository());

  updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const profile = await this.service.updateProfile(
        userId,
        req.body as UpdateProfileBody,
      );
      res.json(profile);
    } catch (error) {
      next(error);
    }
  };
}
