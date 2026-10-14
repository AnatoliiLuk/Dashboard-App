import { Router } from 'express';

import { GoalsController } from '../controllers/goals.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createGoalSchema,
  updateGoalSchema,
} from '../validators/goals.validator';

const router = Router();
const controller = new GoalsController();

router.use(authMiddleware);

router.get('/', controller.getAll);
router.post('/', validateRequest(createGoalSchema), controller.create);
router.patch('/:id', validateRequest(updateGoalSchema), controller.update);
router.delete('/:id', controller.delete);

export default router;
