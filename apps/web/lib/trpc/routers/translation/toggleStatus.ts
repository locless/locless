import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { db, eq, schema } from '@/lib/db';
import { auth, t } from '../../trpc';

export const toggleStatusTranslation = t.procedure
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

    await db
      .update(schema.translations)
      .set({ enabled: !translation.enabled })
      .where(eq(schema.translations.id, input.translationId));

    return {
      enabled: !translation.enabled,
    };
  });
