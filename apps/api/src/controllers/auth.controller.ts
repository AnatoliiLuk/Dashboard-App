import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';
import { AuthService } from '../services/auth.service';
import {
  SESSION_COOKIE,
  clearCookieOptions,
  sessionCookieOptions,
} from '../utils/session-cookie';

export class AuthController {
  private service = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body as {
        email: string;
        password: string;
        name: string;
      };
      const result = await this.service.register(email, password, name);
      this.sendSession(res, result, 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };
      const result = await this.service.login(email, password);
      this.sendSession(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  logout = (_req: Request, res: Response) => {
    res.clearCookie(SESSION_COOKIE, clearCookieOptions(this.secureCookie));
    res.status(204).send();
  };

  private get secureCookie(): boolean {
    return env.NODE_ENV === 'production';
  }

  private sendSession(
    res: Response,
    result: {
      user: { id: string; email: string; name: string };
      token: string;
    },
    status: number,
  ) {
    res.cookie(
      SESSION_COOKIE,
      result.token,
      sessionCookieOptions(env.JWT_EXPIRES_IN, this.secureCookie),
    );
    res.status(status).json({ user: result.user });
  }

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const profile = await this.service.getProfile(userId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  };
}
