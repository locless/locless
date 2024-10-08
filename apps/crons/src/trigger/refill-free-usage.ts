import { schedules, logger } from '@trigger.dev/sdk/v3';
import { and, createConnection, eq, isNull, schema } from '../lib/db';

export const refillFreeUsageTask = schedules.task({
  id: 'refill_free_usage',
  run: async () => {
    const db = createConnection();

    logger.info('task starting..');

    await db
      .update(schema.workspaces)
      .set({
        isUsageExceeded: false,
      })
      .where(and(eq(schema.workspaces.isUsageExceeded, true), isNull(schema.workspaces.deletedAt)));

    return 'Done';
  },
});
