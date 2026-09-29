import { app } from './app';
import { prisma } from './config/database';
import { env } from './config/env';

async function main() {
  await prisma.$connect();
  console.log('Database connected');

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

main().catch(async (error) => {
  console.error('Failed to start API', error);
  await prisma.$disconnect();
  process.exit(1);
});
