// Prints a personal token for the local MCP server (HABITS_PLUS_TOKEN).
// Run: npm run mcp:token -w @habit-tracker/api
// The token expires after JWT_EXPIRES_IN and stops working after a password
// change, like any session.
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';

import { prisma } from '../config/database';
import { AuthService } from '../services/auth.service';
import { loginSchema } from '../validators/auth.validator';

async function main() {
  // Prompts go to stderr; typed characters are hidden while muted.
  let muted = false;
  const output = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) process.stderr.write(chunk, encoding);
      callback();
    },
  });
  const rl = createInterface({
    input: process.stdin,
    output,
    terminal: Boolean(process.stdin.isTTY),
  });
  // The iterator buffers lines, so piped input (email\npassword) works too.
  const lines = rl[Symbol.asyncIterator]();
  const ask = async (prompt: string, hidden = false) => {
    process.stderr.write(prompt);
    muted = hidden;
    const { value } = await lines.next();
    muted = false;
    if (hidden) process.stderr.write('\n');
    return String(value ?? '');
  };

  const email = await ask('Email: ');
  const password = await ask('Password: ', true);
  rl.close();

  const credentials = loginSchema.parse({ email, password });
  const { token } = await new AuthService().login(
    credentials.email,
    credentials.password,
  );

  // Only the token goes to stdout, so it can be piped or captured.
  process.stdout.write(`${token}\n`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
