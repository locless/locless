import { getTenantId } from '@/lib/auth';
import { Workspace, db, schema } from '@/lib/db';
import { newId } from '@repo/id';
import { redirect } from 'next/navigation';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const tenantId = getTenantId();

  const workspace = await db.query.workspaces.findFirst({
    where: (table, { and, eq, isNull }) => and(eq(table.tenantId, tenantId), isNull(table.deletedAt)),
  });

  if (!workspace) {
    const workspace: Workspace = {
      id: newId('workspace'),
      tenantId,
      name: tenantId.includes('org') ? 'Organization' : 'Personal',
      plan: 'free',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptions: {}, // TODO: add subscriptions,
      createdAt: new Date(),
      deletedAt: null,
      enabled: true,
      isPersonal: true,
      canReverseDeletion: true,
    };

    try {
      await db.insert(schema.workspaces).values(workspace);

      return redirect('/app/projects');
    } catch (e) {
      return redirect('/');
    }
  }

  return children;
}
