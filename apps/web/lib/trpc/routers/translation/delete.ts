import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { db, eq, schema } from '@/lib/db';
import { auth, t } from '../../trpc';
import { env } from '@/lib/env';
import { UTApi } from 'uploadthing/server';

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

    const secrets = env();

    const utapi = new UTApi({
      apiKey: secrets.UPLOADTHING_SECRET,
    });

    await utapi.deleteFiles([translation.fileId]);

    await db.transaction(async tx => {
      await tx.delete(schema.translations).where(eq(schema.translations.id, translation.id));

      await tx
        .update(schema.workspaces)
        .set({
          size: translation.workspace.size - translation.size,
        })
        .where(eq(schema.workspaces.id, translation.workspaceId));
    });
  });
