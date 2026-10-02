import { Router } from 'express';

import authRoutes from './auth.routes';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    name: 'Habits+ API',
    version: '0.1.0',
  });
});

router.use('/auth', authRoutes);

export default router;
