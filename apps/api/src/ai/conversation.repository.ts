import type { CoachRole, Prisma } from '@prisma/client';

import { prisma } from '../config/database';
import type { HabitProposal } from './tools/schemas';

export interface StoredCoachMessage {
  id: string;
  role: CoachRole;
  content: string;
  truncated: boolean;
  proposal: HabitProposal | null;
  createdAt: Date;
}

export interface StoredConversation {
  updatedAt: Date;
  messages: StoredCoachMessage[];
}

export interface NewExchange {
  question: string;
  askedAt: Date;
  reply: string;
  truncated: boolean;
  proposal: HabitProposal | null;
}

export interface ConversationStore {
  find(userId: string, limit: number): Promise<StoredConversation | null>;
  saveExchange(userId: string, exchange: NewExchange): Promise<void>;
  delete(userId: string): Promise<void>;
  deleteIdleSince(before: Date, userId?: string): Promise<number>;
}

// Every query is keyed by the userId from the session, never by an id
// from the client, so one person cannot reach another's conversation.
export class ConversationRepository implements ConversationStore {
  // The newest `limit` messages, oldest first.
  async find(
    userId: string,
    limit: number,
  ): Promise<StoredConversation | null> {
    const conversation = await prisma.coachConversation.findUnique({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: limit,
        },
      },
    });

    if (!conversation) {
      return null;
    }

    return {
      updatedAt: conversation.updatedAt,
      messages: conversation.messages.reverse().map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        truncated: message.truncated,
        proposal: message.proposal as HabitProposal | null,
        createdAt: message.createdAt,
      })),
    };
  }

  // The question and its reply are saved together, so a failed request
  // leaves nothing behind.
  async saveExchange(userId: string, exchange: NewExchange): Promise<void> {
    const repliedAt = new Date();
    const messages: Prisma.CoachMessageCreateWithoutConversationInput[] = [
      { role: 'user', content: exchange.question, createdAt: exchange.askedAt },
      {
        role: 'assistant',
        content: exchange.reply,
        truncated: exchange.truncated,
        proposal: exchange.proposal ?? undefined,
        createdAt: repliedAt,
      },
    ];

    await prisma.coachConversation.upsert({
      where: { userId },
      create: { userId, messages: { create: messages } },
      update: { updatedAt: repliedAt, messages: { create: messages } },
    });
  }

  async delete(userId: string): Promise<void> {
    await prisma.coachConversation.deleteMany({ where: { userId } });
  }

  // Messages go with their conversation through the cascade.
  async deleteIdleSince(before: Date, userId?: string): Promise<number> {
    const { count } = await prisma.coachConversation.deleteMany({
      where: { updatedAt: { lt: before }, ...(userId ? { userId } : {}) },
    });
    return count;
  }
}
