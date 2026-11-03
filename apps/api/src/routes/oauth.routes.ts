import { mcpAuthRouter } from '@modelcontextprotocol/sdk/server/auth/router.js';
import { Router } from 'express';

import { OAuthController } from '../controllers/oauth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  MCP_RESOURCE_URL,
  MCP_SCOPES,
  OAUTH_ISSUER_URL,
  OAuthService,
} from '../services/oauth.service';
import { consentDecisionSchema } from '../validators/oauth.validator';

/**
 * The OAuth endpoints MCP clients call (ADR 0004), served by the SDK at the
 * API root: /.well-known/oauth-authorization-server,
 * /.well-known/oauth-protected-resource/api/mcp, /authorize, /token,
 * /register and /revoke. They set their own CORS, body parsing and rate limits.
 */
export const oauthServerRouter = mcpAuthRouter({
  provider: new OAuthService(),
  issuerUrl: OAUTH_ISSUER_URL,
  resourceServerUrl: MCP_RESOURCE_URL,
  scopesSupported: [...MCP_SCOPES],
  resourceName: 'Habits+',
});

/** The consent step, called by the web app with the session cookie. */
const router = Router();
const controller = new OAuthController();

router.use(authMiddleware);
router.get('/consent', controller.getConsent);
router.post(
  '/consent',
  validateRequest(consentDecisionSchema),
  controller.decideConsent,
);

export default router;
