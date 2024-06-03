import { db, eq, schema } from '@/lib/db';
import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { auth, t } from '../../trpc';

export const changeWorkspaceName = t.procedure
  .use(auth)
  .input(
    z.object({
      name: z.string().min(3, 'workspace names must contain at least 3 characters'),
      workspaceId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const ws = await db.query.workspaces.findFirst({
      where: (table, { and, eq, isNull }) => and(eq(table.id, input.workspaceId), isNull(table.deletedAt)),
    });
    if (!ws || ws.tenantId !== ctx.tenant.id) {
      throw new Error('workspace not found');
    }
    await db.transaction(async tx => {
      await tx
        .update(schema.workspaces)
        .set({
          name: input.name,
        })
        .where(eq(schema.workspaces.id, input.workspaceId));

      if (ctx.tenant.id.startsWith('org_')) {
        await clerkClient.organizations.updateOrganization(ctx.tenant.id, {
          name: input.name,
        });
      }
    });
  });
