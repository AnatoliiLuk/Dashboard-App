import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from 'express';

import { env } from '../config/env';
import { McpController } from '../controllers/mcp.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { userRateLimit } from '../middleware/rate-limit.middleware';

const router = Router();
const controller = new McpController();

// MCP clients send a Bearer token. The session cookie is refused: a browser
// attaches it to cross-site requests, a Bearer header it never adds by itself.
function bearerOnly(req: Request, _res: Response, next: NextFunction) {
  if (!req.headers.authorization?.startsWith('Bearer ')) {
    next(new AppError(401, 'Bearer token required'));
    return;
  }
  next();
}

// The MCP spec asks for a WWW-Authenticate challenge on 401, so clients know
// to (re)authenticate.
function authChallenge(
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof AppError && error.statusCode === 401) {
    res.set('WWW-Authenticate', 'Bearer realm="habits-plus"');
  }
  next(error);
}

router.use(
  bearerOnly,
  authMiddleware,
  userRateLimit(env.MCP_RATE_LIMIT_PER_MINUTE, {
    message: 'Too many MCP requests. Wait a minute and try again',
  }),
);
router.post('/', controller.handle);
router.get('/', controller.methodNotAllowed);
router.delete('/', controller.methodNotAllowed);
router.use(authChallenge);

export default router;
