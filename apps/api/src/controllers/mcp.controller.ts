import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { today } from '@repo/core';
import type { NextFunction, Request, Response } from 'express';

import { createMcpServer } from '../mcp/server';
import { CompletionsService } from '../services/completions.service';
import { GoalsService } from '../services/goals.service';
import { HabitsService } from '../services/habits.service';

const services = {
  habits: new HabitsService(),
  completions: new CompletionsService(),
  goals: new GoalsService(),
};

export class McpController {
  // Stateless Streamable HTTP: every POST gets its own server and transport,
  // scoped to the token's user. No session state, so any API instance can
  // answer and nothing leaks between users.
  handle = async (req: Request, res: Response, next: NextFunction) => {
    const server = createMcpServer(
      { userId: req.user!.id, today, scopes: res.locals.mcpScopes },
      services,
    );
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      // Plain JSON replies: no tool streams progress, so SSE adds nothing.
      enableJsonResponse: true,
    });
    res.on('close', () => {
      void transport.close();
      void server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      if (res.headersSent) {
        console.error('MCP request failed after the response started:', error);
        return;
      }
      next(error);
    }
  };

  // Without sessions there is no server-to-client stream (GET) and nothing
  // to end (DELETE). Clients expect 405 here and carry on with POST only.
  methodNotAllowed = (_req: Request, res: Response) => {
    res
      .status(405)
      .set('Allow', 'POST')
      .json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Method not allowed' },
        id: null,
      });
  };
}
