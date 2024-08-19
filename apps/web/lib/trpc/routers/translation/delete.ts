import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { db, eq, schema } from '@/lib/db';
import { auth, t } from '../../trpc';

export const deleteTranslation = t.procedure
  .use(auth)
  .input(
    z.object({
      translationId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const translation = await db.query.translations.findFirst({
      where: (table, { eq, and, isNull }) => and(eq(table.id, input.translationId), isNull(table.deletedAt)),
      with: {
        workspace: true,
      },
    });

    if (!translation || translation.workspace.tenantId !== ctx.tenant.id) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'translation not found' });
    }

    await db.transaction(async tx => {
      await tx
        .update(schema.components)
        .set({ deletedAt: new Date() })
        .where(eq(schema.components.id, input.translationId));

      await tx
        .update(schema.translations)
        .set({ size: translation.workspace.size - translation.size })
        .where(eq(schema.workspaces.id, translation.workspace.id));
    });
  });
