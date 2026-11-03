import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../middleware/error.middleware';
import { OAuthService } from '../services/oauth.service';
import {
  consentQuerySchema,
  grantParamsSchema,
  type ConsentDecisionBody,
} from '../validators/oauth.validator';

export class OAuthController {
  private service = new OAuthService();

  getConsent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = consentQuerySchema.safeParse(req.query);
      if (!query.success) {
        throw new AppError(400, 'Authorization request is required');
      }

      res.json(await this.service.describeConsent(query.data.request));
    } catch (error) {
      next(error);
    }
  };

  decideConsent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { request, approve } = req.body as ConsentDecisionBody;
      const redirectTo = await this.service.decideConsent(
        request,
        approve,
        req.user!.id,
      );

      res.json({ redirectTo });
    } catch (error) {
      next(error);
    }
  };

  listGrants = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.service.listGrants(req.user!.id));
    } catch (error) {
      next(error);
    }
  };

  revokeGrant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = grantParamsSchema.safeParse(req.params);
      if (!params.success) {
        throw new AppError(404, 'Connected app not found');
      }

      await this.service.revokeGrant(req.user!.id, params.data.clientId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
