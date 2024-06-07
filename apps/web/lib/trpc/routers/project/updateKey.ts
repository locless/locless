import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { db, eq, schema } from '@/lib/db';
import { auth, t } from '../../trpc';
import { newId } from '@repo/id';

export const updateProjectKey = t.procedure
  .use(auth)
  .input(
    z.object({
      projectId: z.string(),
      keyType: z.enum(['public', 'private']),
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

    let values = {};
    let key = '';

    if (input.keyType === 'public') {
      key = newId('keyPublic');
      values = {
        keyPublic: key,
      };
    } else {
      key = newId('keyAuth');
      values = {
        keyAuth: key,
      };
    }

    await db.update(schema.projects).set(values).where(eq(schema.projects.id, input.projectId));

    return {
      key,
    };
  });
