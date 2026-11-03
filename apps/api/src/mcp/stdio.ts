// Stage 1 MCP entry: one person, one local process, JSON-RPC over stdio.
// Run: HABITS_PLUS_TOKEN=... npm run mcp -w @habit-tracker/api
// (get a token with `npm run mcp:token -w @habit-tracker/api`).
import { today } from '@repo/core';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { authenticateToken } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { CompletionsService } from '../services/completions.service';
import { GoalsService } from '../services/goals.service';
import { HabitsService } from '../services/habits.service';
import { createMcpServer } from './server';

// stdout belongs to the protocol: a stray console.log would corrupt it.
console.log = console.error;

async function main() {
  const token = process.env.HABITS_PLUS_TOKEN?.trim();
  if (!token) {
    throw new AppError(
      401,
      'Set HABITS_PLUS_TOKEN (npm run mcp:token -w @habit-tracker/api)',
    );
  }

  // Checked once at start-up: restart the server after a password change.
  const { id: userId } = await authenticateToken(token);

  const server = createMcpServer(
    { userId, today },
    {
      habits: new HabitsService(),
      completions: new CompletionsService(),
      goals: new GoalsService(),
    },
  );
  await server.connect(new StdioServerTransport());
  console.error('Habits+ MCP server running on stdio');
}

main().catch((error: unknown) => {
  console.error(
    'Habits+ MCP server failed to start:',
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
