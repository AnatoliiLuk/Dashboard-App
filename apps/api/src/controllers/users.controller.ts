import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';
import { UsersRepository } from '../repositories/users.repository';
import { UsersService } from '../services/users.service';
import { generateToken } from '../utils/jwt.util';
import { SESSION_COOKIE, sessionCookieOptions } from '../utils/session-cookie';
import type {
  ChangePasswordBody,
  UpdateProfileBody,
} from '../validators/users.validator';

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

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const ver = await this.service.changePassword(
        userId,
        req.body as ChangePasswordBody,
      );

      // Every other session is now invalid; this one continues with a new
      // token, as a cookie for the web and in the body for Bearer clients.
      const token = generateToken({ id: userId, ver });
      res.cookie(
        SESSION_COOKIE,
        token,
        sessionCookieOptions(env.JWT_EXPIRES_IN, env.NODE_ENV === 'production'),
      );
      res.json({ token });
    } catch (error) {
      next(error);
    }
  };
}
