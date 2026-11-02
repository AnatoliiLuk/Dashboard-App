import { Router } from 'express';

import { UsersController } from '../controllers/users.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { userRateLimit } from '../middleware/rate-limit.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  changePasswordSchema,
  updateProfileSchema,
} from '../validators/users.validator';

const FAILED_UPDATES_PER_MINUTE = 5;
const PASSWORD_CHANGES_PER_MINUTE = 5;

const router = Router();
const controller = new UsersController();

router.use(authMiddleware);

// Only failed attempts count, so name edits are never throttled but a
// session holder cannot guess the password at bcrypt speed.
router.patch(
  '/me',
  userRateLimit(FAILED_UPDATES_PER_MINUTE, {
    message: 'Too many attempts. Wait a minute and try again',
    onlyFailures: true,
  }),
  validateRequest(updateProfileSchema),
  controller.updateMe,
);

// Every attempt counts: each one verifies the current password.
router.post(
  '/me/password',
  userRateLimit(PASSWORD_CHANGES_PER_MINUTE, {
    message: 'Too many attempts. Wait a minute and try again',
  }),
  validateRequest(changePasswordSchema),
  controller.changePassword,
);

export default router;
