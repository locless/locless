import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { db, eq, schema } from '@/lib/db';
import { auth, t } from '../../trpc';

export const deleteComponent = t.procedure
  .use(auth)
  .input(
    z.object({
      componentId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const component = await db.query.components.findFirst({
      where: (table, { eq, and, isNull }) => and(eq(table.id, input.componentId), isNull(table.deletedAt)),
      with: {
        workspace: true,
      },
    });

    if (!component || component.workspace.tenantId !== ctx.tenant.id) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'component not found' });
    }

    await db
      .update(schema.components)
      .set({ deletedAt: new Date() })
      .where(eq(schema.components.id, input.componentId));
  });
