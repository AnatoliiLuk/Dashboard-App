import { today as serverToday } from '@repo/core';
import type { NextFunction, Request, Response } from 'express';

import { anthropicClient } from '../ai/client';
import { CoachService } from '../ai/coach.service';
import { CoachContextBuilder } from '../ai/context.builder';
import { ConversationRepository } from '../ai/conversation.repository';
import { ConversationService } from '../ai/conversation.service';
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
  private conversations = new ConversationService(
    new ConversationRepository(),
    new CoachService(
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
    ),
    { retentionDays: env.AI_CONVERSATION_RETENTION_DAYS },
  );

  chat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, locale, today } = req.body as CoachChatBody;
      const reply = await this.conversations.send({
        message,
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

  getConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages = await this.conversations.get(req.user!.id);
      res.json({
        messages: messages.map(
          ({ id, role, content, truncated, proposal }) => ({
            id,
            role,
            content,
            truncated,
            proposal,
          }),
        ),
        retentionDays: env.AI_CONVERSATION_RETENTION_DAYS,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteConversation = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.conversations.delete(req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
