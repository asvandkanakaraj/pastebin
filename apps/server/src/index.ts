import { app } from './app.js';
import { logger } from './utils/logger.js';
import { APP_NAME } from '@pastebin/shared';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`[${APP_NAME}] Server running at http://localhost:${PORT}`);
});

// Process-level crash guards — log before Node exits so Render can capture the root cause
process.on('uncaughtException', (err) => {
  logger.error(`[uncaughtException] ${err.message}\n${err.stack}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error(`[unhandledRejection] ${reason?.message ?? reason}`);
  process.exit(1);
});
