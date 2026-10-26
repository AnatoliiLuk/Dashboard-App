import type {
  ConversationStore,
  StoredCoachMessage,
} from './conversation.repository';
import type { CoachReply, CoachService } from './coach.service';
import type { CoachLocale } from './prompts/coach.system';

const DAY_MS = 86_400_000;

// Stored messages loaded for each request. The coach service keeps only the
// last few of them for the model (HISTORY_MAX_MESSAGES).
export const CONVERSATION_LOAD_LIMIT = 20;

export interface ConversationConfig {
  retentionDays: number;
}

export interface SendInput {
  userId: string;
  message: string;
  locale: CoachLocale;
  today: string;
}

// Keeps the one ongoing conversation per person on the server. The coach
// service stays stateless: this class gives it the history and saves what
// came back.
export class ConversationService {
  constructor(
    private store: ConversationStore,
    private coach: Pick<CoachService, 'reply'>,
    private config: ConversationConfig,
  ) {}

  async get(userId: string): Promise<StoredCoachMessage[]> {
    await this.expire(userId);
    const conversation = await this.store.find(userId, CONVERSATION_LOAD_LIMIT);
    return conversation?.messages ?? [];
  }

  async send({
    userId,
    message,
    locale,
    today,
  }: SendInput): Promise<CoachReply> {
    const askedAt = new Date();
    const history = await this.get(userId);

    const reply = await this.coach.reply({
      messages: [
        ...history.map(({ role, content }) => ({ role, content })),
        { role: 'user', content: message },
      ],
      locale,
      userId,
      today,
    });

    // The tokens are already spent, so a failed save is logged but still
    // returns the reply. The next turn just has less history.
    try {
      await this.store.saveExchange(userId, {
        question: message,
        askedAt,
        reply: reply.text,
        truncated: reply.truncated,
        proposal: reply.proposal,
      });
    } catch (error) {
      console.error('Could not save the coach conversation:', error);
    }

    return reply;
  }

  async delete(userId: string): Promise<void> {
    await this.store.delete(userId);
  }

  // Checked on every read, so an expired conversation is never shown or
  // sent to the model even if the purge script has not run yet.
  private async expire(userId: string): Promise<void> {
    await this.store.deleteIdleSince(
      retentionCutoff(this.config.retentionDays),
      userId,
    );
  }
}

export function retentionCutoff(retentionDays: number, now = new Date()): Date {
  return new Date(now.getTime() - retentionDays * DAY_MS);
}
