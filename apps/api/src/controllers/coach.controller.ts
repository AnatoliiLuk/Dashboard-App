import { today as serverToday } from '@repo/core';
import type { NextFunction, Request, Response } from 'express';

import { anthropicClient } from '../ai/client';
import { CoachService } from '../ai/coach.service';
import { CoachContextBuilder } from '../ai/context.builder';
import { DailyTokenBudget } from '../ai/guardrails/token-budget';
import { CoachToolHandlers } from '../ai/tools/handlers';
import { AiUsageRepository } from '../ai/usage.repository';
import { env } from '../config/env';
import { CompletionsService } from '../services/completions.service';
import { GoalsService } from '../services/goals.service';
import { HabitsService } from '../services/habits.service';
import type { CoachChatBody } from '../validators/coach.validator';

const dataServices = {
  habits: new HabitsService(),
  completions: new CompletionsService(),
  goals: new GoalsService(),
};
const usage = new AiUsageRepository();

export class CoachController {
  private service = new CoachService(
    {
      client: anthropicClient,
      tools: new CoachToolHandlers(dataServices),
      context: new CoachContextBuilder(dataServices),
      budget: new DailyTokenBudget(usage, env.AI_DAILY_TOKEN_BUDGET),
      usage,
    },
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
