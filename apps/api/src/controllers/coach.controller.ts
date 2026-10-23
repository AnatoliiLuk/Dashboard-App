import type { NextFunction, Request, Response } from 'express';

import { anthropicClient } from '../ai/client';
import { CoachService } from '../ai/coach.service';
import { env } from '../config/env';
import type { CoachChatBody } from '../validators/coach.validator';

export class CoachController {
  private service = new CoachService(anthropicClient, {
    enabled: env.AI_ENABLED,
    model: env.ANTHROPIC_MODEL,
    maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS,
  });

  chat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messages, locale } = req.body as CoachChatBody;
      const reply = await this.service.reply({ messages, locale });
      res.json({ reply: reply.text, truncated: reply.truncated });
    } catch (error) {
      next(error);
    }
  };
}
