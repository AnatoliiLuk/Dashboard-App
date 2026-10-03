import { Router } from 'express';

import authRoutes from './auth.routes';
import completionsRoutes from './completions.routes';
import habitsRoutes from './habits.routes';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    name: 'Habits+ API',
    version: '0.1.0',
  });
});

router.use('/auth', authRoutes);
router.use('/habits', habitsRoutes);
router.use('/completions', completionsRoutes);

export default router;
