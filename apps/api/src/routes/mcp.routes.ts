import { getOAuthProtectedResourceMetadataUrl } from '@modelcontextprotocol/sdk/server/auth/router.js';
import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from 'express';

import { env } from '../config/env';
import { McpController } from '../controllers/mcp.controller';
import { AppError } from '../middleware/error.middleware';
import { userRateLimit } from '../middleware/rate-limit.middleware';
import { MCP_RESOURCE_URL, OAuthService } from '../services/oauth.service';

const router = Router();
const controller = new McpController();
const oauth = new OAuthService();

const RESOURCE_METADATA_URL =
  getOAuthProtectedResourceMetadataUrl(MCP_RESOURCE_URL);

// MCP clients send a Bearer token: an OAuth access token or a personal JWT
// (ADR 0004). The session cookie is refused: a browser attaches it to
// cross-site requests, a Bearer header it never adds by itself.
async function mcpAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ')
      ? header.slice('Bearer '.length).trim()
      : '';
    if (!token) {
      throw new AppError(401, 'Bearer token required');
    }

    const principal = await oauth.authenticateMcpToken(token);
    req.user = { id: principal.userId, ver: principal.tokenVersion };
    res.locals.mcpScopes = principal.scopes;
    next();
  } catch (error) {
    next(error);
  }
}

// On 401 the MCP spec asks for a challenge that points to the protected
// resource metadata, where clients find the authorization server.
function authChallenge(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof AppError && error.statusCode === 401) {
    const invalid = req.headers.authorization ? ', error="invalid_token"' : '';
    res.set(
      'WWW-Authenticate',
      `Bearer resource_metadata="${RESOURCE_METADATA_URL}"${invalid}`,
    );
  }
  next(error);
}

router.use(
  mcpAuth,
  userRateLimit(env.MCP_RATE_LIMIT_PER_MINUTE, {
    message: 'Too many MCP requests. Wait a minute and try again',
  }),
);
router.post('/', controller.handle);
router.get('/', controller.methodNotAllowed);
router.delete('/', controller.methodNotAllowed);
router.use(authChallenge);

export default router;
