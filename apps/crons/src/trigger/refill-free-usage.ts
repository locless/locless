import { task } from '@trigger.dev/sdk/v3';

import { and, createConnection, eq, isNull, schema } from '../lib/db';

export const createInvoiceTask = task({
  id: 'refill_free_usage',
  run: async () => {
    const db = createConnection();

    await db
      .update(schema.workspaces)
      .set({
        isUsageExceeded: false,
      })
      .where(
        and(
          eq(schema.workspaces.isUsageExceeded, true),
          eq(schema.workspaces.plan, 'free'),
          isNull(schema.workspaces.deletedAt)
        )
      );

    return 'Done';
  },
});
