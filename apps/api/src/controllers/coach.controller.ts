import type { NextFunction, Request, Response } from 'express';

import { anthropicClient } from '../ai/client';
import { COACH_SYSTEM_PROMPT, CoachService } from '../ai/coach.service';
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
      const { messages } = req.body as CoachChatBody;
      const reply = await this.service.reply({
        system: COACH_SYSTEM_PROMPT,
        messages,
      });
      res.json({ reply: reply.text, truncated: reply.truncated });
    } catch (error) {
      next(error);
    }
  };
}
