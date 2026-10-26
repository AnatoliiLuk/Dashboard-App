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
router.use(userRateLimit(env.AI_RATE_LIMIT_PER_MINUTE));

router.post('/chat', validateRequest(coachChatSchema), controller.chat);

export default router;
