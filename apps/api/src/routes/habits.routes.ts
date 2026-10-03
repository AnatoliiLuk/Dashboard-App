import { Router } from 'express';

import { HabitsController } from '../controllers/habits.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createHabitSchema,
  updateHabitSchema,
} from '../validators/habits.validator';

const router = Router();
const controller = new HabitsController();

router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', validateRequest(createHabitSchema), controller.create);
router.patch('/:id', validateRequest(updateHabitSchema), controller.update);
router.delete('/:id', controller.delete);

export default router;
