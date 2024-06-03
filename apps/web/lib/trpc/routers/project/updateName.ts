import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { db, eq, schema } from '@/lib/db';
import { auth, t } from '../../trpc';

export const updateProjectName = t.procedure
  .use(auth)
  .input(
    z.object({
      name: z.string().min(3, 'project names must contain at least 3 characters'),
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

    await db
      .update(schema.projects)
      .set({
        name: input.name,
      })
      .where(eq(schema.projects.id, input.projectId));
  });
