import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env';
import {
  errorMiddleware,
  notFoundMiddleware,
} from './middleware/error.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import routes from './routes';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

app.get('/health', async (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
