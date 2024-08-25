import { type Workspace, db, schema } from '@/lib/db';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { auth, t } from '../../trpc';
import { newId } from '@repo/id';
import { clerkClient } from '@clerk/nextjs/server';
import { defaultProSubscriptions } from '@repo/billing';

export const createWorkspace = t.procedure
  .use(auth)
  .input(
    z.object({
      name: z.string().min(1).max(50),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user?.id;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not found',
      });
    }

    const subscriptions = defaultProSubscriptions();

    const org = await clerkClient.organizations.createOrganization({
      name: input.name,
      createdBy: userId,
    });

    const workspace: Workspace = {
      id: newId('workspace'),
      tenantId: org.id,
      name: input.name,
      plan: 'free',
      stripeCustomerId: null,
      subscriptions,
      createdAt: new Date(),
      deletedAt: null,
      enabled: true,
      isPersonal: false,
      canReverseDeletion: true,
      isUsageExceeded: false,
      planChanged: null,
      planDowngradeRequest: null,
      size: 0,
    };

    await db.insert(schema.workspaces).values(workspace);

    return {
      workspace,
      organizationId: org.id,
    };
  });
