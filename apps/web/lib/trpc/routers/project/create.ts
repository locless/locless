import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { Project, db, schema } from '@/lib/db';
import { auth, t } from '../../trpc';
import { newId } from '@repo/id';

export const createProject = t.procedure
  .use(auth)
  .input(
    z.object({
      name: z.string().min(1).max(50),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const ws = await db.query.workspaces.findFirst({
      where: (table, { and, eq, isNull }) => and(eq(table.tenantId, ctx.tenant.id), isNull(table.deletedAt)),
    });

    if (!ws) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'workspace not found',
      });
    }

    const projectId = newId('project');

    const project: Project = {
      id: projectId,
      name: input.name,
      workspaceId: ws.id,
      createdAt: new Date(),
      deletedAt: null,
      enabled: true,
    };

    await db.insert(schema.projects).values(project);

    return {
      id: projectId,
    };
  });
