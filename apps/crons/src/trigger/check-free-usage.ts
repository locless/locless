import { Tinybird } from '../lib/tinybird';
import { env } from '../lib/env';
import { task } from '@trigger.dev/sdk/v3';
import { createConnection, eq, schema } from '../lib/db';

const GIGABYTE = Math.pow(1024, 3);
const MAX_FREE_USAGE = 1 * GIGABYTE;

export const createInvoiceTask = task({
  id: 'check_free_usage',
  run: async () => {
    const db = createConnection();
    const tinybird = new Tinybird(env().TINYBIRD_TOKEN);

    const workspaces = await db.query.workspaces.findMany({
      where: (table, { isNull, eq, and }) =>
        and(
          isNull(table.stripeCustomerId),
          isNull(table.subscriptions),
          eq(table.plan, 'free'),
          eq(table.isUsageExceeded, false),
          isNull(table.deletedAt)
        ),
    });

    const date = new Date();

    for (const ws of workspaces) {
      const storageUsage = await tinybird
        .storageUsage({
          workspaceId: ws.id,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
        })
        .then((res: any) => res.data.at(0)?.bandwidth ?? 0);

      if (storageUsage >= MAX_FREE_USAGE) {
        await db
          .update(schema.workspaces)
          .set({
            isUsageExceeded: true,
          })
          .where(eq(schema.workspaces.id, ws.id));
        continue;
      }

      const apiRequests = await tinybird
        .apiRequests({
          workspaceId: ws.id,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
        })
        .then((res: any) => res.data.at(0)?.success ?? 0);

      if (apiRequests > 1000) {
        await db
          .update(schema.workspaces)
          .set({
            isUsageExceeded: true,
          })
          .where(eq(schema.workspaces.id, ws.id));
        continue;
      }
    }

    return 'Done';
  },
});
