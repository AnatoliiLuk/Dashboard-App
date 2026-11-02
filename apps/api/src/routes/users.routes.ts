import { Router } from 'express';

import { UsersController } from '../controllers/users.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { updateProfileSchema } from '../validators/users.validator';

const router = Router();
const controller = new UsersController();

router.use(authMiddleware);

router.patch('/me', validateRequest(updateProfileSchema), controller.updateMe);

export default router;
