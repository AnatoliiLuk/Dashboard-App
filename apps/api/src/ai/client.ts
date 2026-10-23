import Anthropic from '@anthropic-ai/sdk';

import { env } from '../config/env';

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

// The only surface the rest of the app uses. Tests pass a fake instead.
export interface ModelClient {
  createMessage(
    params: Anthropic.MessageCreateParamsNonStreaming,
  ): Promise<Anthropic.Message>;
}

let sdk: Anthropic | undefined;

// Created on first use, so the app and the tests can start without a key.
function getSdk(): Anthropic {
  sdk ??= new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    timeout: REQUEST_TIMEOUT_MS,
    maxRetries: MAX_RETRIES,
  });
  return sdk;
}

export const anthropicClient: ModelClient = {
  createMessage: (params) => getSdk().messages.create(params),
};
