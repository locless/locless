import { createConnection, eq, schema } from '../lib/db';
import { logger, task } from '@trigger.dev/sdk/v3';

export const downgradeTask = task({
  id: 'billing_downgrade',
  run: async () => {
    logger.info('task starting..');

    const db = createConnection();

    const workspaces = await db.query.workspaces.findMany({
      where: (table, { and, isNotNull }) => and(isNotNull(table.planDowngradeRequest)),
    });

    logger.info(`found ${workspaces.length} workspaces`);

    for (const ws of workspaces) {
      if (ws.planDowngradeRequest !== null) {
        await db
          .update(schema.workspaces)
          .set({
            plan: ws.planDowngradeRequest,
            planChanged: null,
            planDowngradeRequest: null,
            subscriptions: ws.planDowngradeRequest === 'free' ? null : undefined,
          })
          .where(eq(schema.workspaces.id, ws.id));
      }
    }
  },
});
