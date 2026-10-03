import { Router } from 'express';

import { CompletionsController } from '../controllers/completions.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createCompletionSchema,
  toggleCompletionSchema,
} from '../validators/completions.validator';

const router = Router();
const controller = new CompletionsController();

router.use(authMiddleware);

router.get('/', controller.getAll);
router.post('/', validateRequest(createCompletionSchema), controller.create);
router.post(
  '/toggle',
  validateRequest(toggleCompletionSchema),
  controller.toggle,
);
router.delete('/:id', controller.delete);

export default router;
