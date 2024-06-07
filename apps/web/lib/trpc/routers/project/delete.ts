import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { db, eq, schema } from '@/lib/db';
import { auth, t } from '../../trpc';

export const deleteProject = t.procedure
  .use(auth)
  .input(
    z.object({
      projectId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const project = await db.query.projects.findFirst({
      where: (table, { eq, and, isNull }) => and(eq(table.id, input.projectId), isNull(table.deletedAt)),
      with: {
        workspace: true,
      },
    });

    if (!project || project.workspace.tenantId !== ctx.tenant.id) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'project not found' });
    }

    await db.transaction(async tx => {
      await tx.update(schema.projects).set({ deletedAt: new Date() }).where(eq(schema.projects.id, input.projectId));

      const componentIds = await tx.query.components.findMany({
        where: eq(schema.components.projectId, input.projectId!),
        columns: { id: true },
      });

      if (componentIds.length > 0) {
        await tx
          .update(schema.components)
          .set({ deletedAt: new Date() })
          .where(eq(schema.components.projectId, input.projectId!));
      }
    });
  });
