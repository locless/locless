import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { db } from '@/lib/db';
import { auth, t } from '../../trpc';
import { unkey } from '@/lib/unkey';

export const deleteProjectKey = t.procedure
  .use(auth)
  .input(
    z.object({
      keyId: z.string(),
      projectId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const project = await db.query.projects.findFirst({
      where: (table, { eq, and, isNull }) => and(eq(table.id, input.projectId), isNull(table.deletedAt)),
      with: {
        workspace: true,
      },
    });

    if (!project || project.workspace.tenantId !== ctx.tenant.id) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'project not found' });
    }

    await unkey.keys.delete({ keyId: input.keyId });
  });
