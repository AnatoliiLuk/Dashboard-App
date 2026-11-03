import { Router } from 'express';

import authRoutes from './auth.routes';
import coachRoutes from './coach.routes';
import completionsRoutes from './completions.routes';
import goalsRoutes from './goals.routes';
import habitsRoutes from './habits.routes';
import mcpRoutes from './mcp.routes';
import oauthRoutes from './oauth.routes';
import usersRoutes from './users.routes';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    name: 'Habits+ API',
    version: '0.1.0',
  });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/habits', habitsRoutes);
router.use('/completions', completionsRoutes);
router.use('/goals', goalsRoutes);
router.use('/coach', coachRoutes);
router.use('/mcp', mcpRoutes);
router.use('/oauth', oauthRoutes);

export default router;
