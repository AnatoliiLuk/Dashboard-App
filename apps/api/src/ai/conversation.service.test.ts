import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { AppError } from '../middleware/error.middleware';
import type { CoachReply, CoachReplyInput } from './coach.service';
import type {
  ConversationStore,
  StoredCoachMessage,
} from './conversation.repository';
import {
  CONVERSATION_LOAD_LIMIT,
  ConversationService,
  retentionCutoff,
} from './conversation.service';

const userId = 'user-a';
const sendInput = {
  userId,
  message: 'And tomorrow?',
  locale: 'en' as const,
  today: '2026-10-26',
};

function stored(
  role: StoredCoachMessage['role'],
  content: string,
): StoredCoachMessage {
  return {
    id: `${role}-${content}`,
    role,
    content,
    truncated: false,
    proposal: null,
    createdAt: new Date('2026-10-25T10:00:00Z'),
  };
}

function coachReply(overrides: Partial<CoachReply> = {}): CoachReply {
  return {
    text: 'Read ten pages.',
    promptVersion: 'test',
    stopReason: 'end_turn',
    truncated: false,
    proposal: null,
    toolCalls: 0,
    guardFlags: [],
    usage: {
      inputTokens: 1,
      outputTokens: 1,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
    },
    ...overrides,
  };
}

function fakeStore(messages: StoredCoachMessage[] = []) {
  return {
    find: jest.fn<ConversationStore['find']>(async () =>
      messages.length ? { updatedAt: new Date(), messages } : null,
    ),
    saveExchange: jest.fn<ConversationStore['saveExchange']>(
      async () => undefined,
    ),
    delete: jest.fn<ConversationStore['delete']>(async () => undefined),
    deleteIdleSince: jest.fn<ConversationStore['deleteIdleSince']>(
      async () => 0,
    ),
  };
}

function fakeCoach(result: CoachReply | Error = coachReply()) {
  return {
    reply: jest.fn<(input: CoachReplyInput) => Promise<CoachReply>>(
      async () => {
        if (result instanceof Error) throw result;
        return result;
      },
    ),
  };
}

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('ConversationService', () => {
  it('sends the stored history plus the new message to the coach', async () => {
    const store = fakeStore([
      stored('user', 'How is my reading?'),
      stored('assistant', 'Seven days.'),
    ]);
    const coach = fakeCoach();
    const service = new ConversationService(store, coach, {
      retentionDays: 30,
    });

    await service.send(sendInput);

    expect(store.find).toHaveBeenCalledWith(userId, CONVERSATION_LOAD_LIMIT);
    expect(coach.reply).toHaveBeenCalledWith({
      messages: [
        { role: 'user', content: 'How is my reading?' },
        { role: 'assistant', content: 'Seven days.' },
        { role: 'user', content: 'And tomorrow?' },
      ],
      locale: 'en',
      userId,
      today: '2026-10-26',
    });
  });

  it('saves the question and the reply together', async () => {
    const proposal = { name: 'Read', color: 'sky' as const, reason: 'Easy.' };
    const store = fakeStore();
    const coach = fakeCoach(coachReply({ truncated: true, proposal }));
    const service = new ConversationService(store, coach, {
      retentionDays: 30,
    });

    const reply = await service.send(sendInput);

    expect(reply.text).toBe('Read ten pages.');
    expect(store.saveExchange).toHaveBeenCalledWith(userId, {
      question: 'And tomorrow?',
      askedAt: expect.any(Date),
      reply: 'Read ten pages.',
      truncated: true,
      proposal,
    });
  });

  it('saves nothing when the coach fails', async () => {
    const store = fakeStore();
    const coach = fakeCoach(new AppError(502, 'unavailable'));
    const service = new ConversationService(store, coach, {
      retentionDays: 30,
    });

    await expect(service.send(sendInput)).rejects.toThrow('unavailable');
    expect(store.saveExchange).not.toHaveBeenCalled();
  });

  it('still returns the reply when saving fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const store = fakeStore();
    store.saveExchange.mockRejectedValueOnce(new Error('db down'));
    const service = new ConversationService(store, fakeCoach(), {
      retentionDays: 30,
    });

    await expect(service.send(sendInput)).resolves.toEqual(
      expect.objectContaining({ text: 'Read ten pages.' }),
    );
  });

  it("deletes this person's idle conversation before reading it", async () => {
    const store = fakeStore();
    const service = new ConversationService(store, fakeCoach(), {
      retentionDays: 30,
    });

    await service.get(userId);

    const [cutoff, scopedTo] = store.deleteIdleSince.mock.calls[0];
    expect(scopedTo).toBe(userId);
    const ageDays = (Date.now() - cutoff.getTime()) / 86_400_000;
    expect(ageDays).toBeCloseTo(30, 3);
    expect(store.deleteIdleSince.mock.invocationCallOrder[0]).toBeLessThan(
      store.find.mock.invocationCallOrder[0],
    );
  });
});

describe('retentionCutoff', () => {
  it('goes back the given number of days', () => {
    expect(
      retentionCutoff(30, new Date('2026-10-31T12:00:00Z')).toISOString(),
    ).toBe('2026-10-01T12:00:00.000Z');
  });
});
