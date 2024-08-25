import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { db, eq, schema } from '@/lib/db';
import { auth, t } from '../../trpc';
import { env } from '@/lib/env';
import { UTApi } from 'uploadthing/server';

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

    const secrets = env();

    const utapi = new UTApi({
      apiKey: secrets.UPLOADTHING_SECRET,
    });

    await utapi.deleteFiles([component.fileId]);

    await db.transaction(async tx => {
      await tx.delete(schema.components).where(eq(schema.components.id, component.id));

      await tx
        .update(schema.workspaces)
        .set({
          size: component.workspace.size - component.size,
        })
        .where(eq(schema.workspaces.id, component.workspaceId));
    });
  });
