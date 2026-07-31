import { app } from './app.js';
import { logger } from './utils/logger.js';
import { APP_NAME } from '@pastebin/shared';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`[${APP_NAME}] Server running at http://localhost:${PORT}`);
});
