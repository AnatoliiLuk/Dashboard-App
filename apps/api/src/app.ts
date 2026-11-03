import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env';
import {
  errorMiddleware,
  notFoundMiddleware,
} from './middleware/error.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import { originMiddleware } from './middleware/origin.middleware';
import routes from './routes';
import { oauthServerRouter } from './routes/oauth.routes';

export const app = express();

app.use(helmet());
// Before CORS and the origin check: MCP clients call these from other
// origins (or none), and they never use the session cookie.
app.use(oauthServerRouter);
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(originMiddleware);
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
