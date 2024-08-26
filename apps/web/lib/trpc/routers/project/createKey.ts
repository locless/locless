import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { db } from '@/lib/db';
import { auth, t } from '../../trpc';
import { unkey, unkey_api_id } from '@/lib/unkey';

export const createProjectKey = t.procedure
  .use(auth)
  .input(
    z.object({
      name: z.string().min(1).max(50),
      projectId: z.string(),
      permission: z.enum(['api.private_key', 'api.public_key']),
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

    const prefix = input.permission === 'api.private_key' ? 'loc_auth' : 'loc_pub';

    const key = await unkey.keys.create({
      apiId: unkey_api_id,
      prefix,
      ownerId: project.id,
      name: input.name,
      permissions: [input.permission],
    });

    return {
      key: key.result?.key,
    };
  });
