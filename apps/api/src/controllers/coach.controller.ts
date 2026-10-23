import { today as serverToday } from '@repo/core';
import type { NextFunction, Request, Response } from 'express';

import { anthropicClient } from '../ai/client';
import { CoachService } from '../ai/coach.service';
import { CoachToolHandlers } from '../ai/tools/handlers';
import { env } from '../config/env';
import { CompletionsService } from '../services/completions.service';
import { GoalsService } from '../services/goals.service';
import { HabitsService } from '../services/habits.service';
import type { CoachChatBody } from '../validators/coach.validator';

export class CoachController {
  private service = new CoachService(
    anthropicClient,
    new CoachToolHandlers({
      habits: new HabitsService(),
      completions: new CompletionsService(),
      goals: new GoalsService(),
    }),
    {
      enabled: env.AI_ENABLED,
      model: env.ANTHROPIC_MODEL,
      maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS,
    },
  );

  chat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messages, locale, today } = req.body as CoachChatBody;
      const reply = await this.service.reply({
        messages,
        locale,
        userId: req.user!.id,
        today: today ?? serverToday(),
      });
      res.json({
        reply: reply.text,
        truncated: reply.truncated,
        proposal: reply.proposal,
      });
    } catch (error) {
      next(error);
    }
  };
}
