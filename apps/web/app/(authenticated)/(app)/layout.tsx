import { createWorkspace, findWorkspace } from '@/lib/api';
import { getTenantId } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const tenantId = getTenantId();
    const workspace = await findWorkspace({
        tenantId,
        headers: {
            authorization: `${tenantId}`,
        },
    });

    if (!workspace) {
        const newWorkspace = await createWorkspace({
            tenantId,
            name: tenantId.includes('org') ? 'Organization' : 'Personal',
            plan: 'free', // TODO: probably change plan for orgs
            isPersonal: !tenantId.includes('org'),
            headers: {
                authorization: `${tenantId}`,
            },
        });

        if (newWorkspace) {
            return redirect('/app/projects');
        }

        return redirect('/');
    }

    return children;
}
