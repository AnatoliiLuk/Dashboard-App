import { Router } from 'express';

import { CoachController } from '../controllers/coach.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { coachChatSchema } from '../validators/coach.validator';

const router = Router();
const controller = new CoachController();

router.use(authMiddleware);

router.post('/chat', validateRequest(coachChatSchema), controller.chat);

export default router;
