import { Router } from 'express';

import { CoachController } from '../controllers/coach.controller';
import { env } from '../config/env';
import { authMiddleware } from '../middleware/auth.middleware';
import { userRateLimit } from '../middleware/rate-limit.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { coachChatSchema } from '../validators/coach.validator';

const router = Router();
const controller = new CoachController();

router.use(authMiddleware);

// Only the model call is rate limited. Reading or deleting the
// conversation costs nothing and should always work.
router.post(
  '/chat',
  userRateLimit(env.AI_RATE_LIMIT_PER_MINUTE),
  validateRequest(coachChatSchema),
  controller.chat,
);
router.get('/conversation', controller.getConversation);
router.delete('/conversation', controller.deleteConversation);

export default router;
