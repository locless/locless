import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server';
import { db } from './lib/db';

const findWorkspace = async ({ tenantId }: { tenantId: string }) => {
  const workspace = await db.query.workspaces.findFirst({
    where: (table, { and, eq, isNull }) => and(eq(table.tenantId, tenantId), isNull(table.deletedAt)),
  });
  return workspace;
};

const isProtectedRoute = createRouteMatcher(['/app(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, orgId } = auth();
    if (!userId) {
      return auth().redirectToSignIn({ returnBackUrl: req.url });
    }

    if (orgId) {
      const workspace = await findWorkspace({
        tenantId: orgId,
      });

      if (!workspace && req.nextUrl.pathname !== '/new') {
        await clerkClient.organizations.deleteOrganization(orgId);
        return NextResponse.redirect(new URL('/new', req.url));
      }

      if (
        workspace &&
        ![
          '/app/billing',
          '/app/billing/stripe',
          '/app/billing/stripe/success',
          '/app/billing/plans',
          '/app/projects',
          '/',
        ].includes(req.nextUrl.pathname)
      ) {
        if (workspace.plan === 'free') {
          return NextResponse.redirect(new URL('/app/billing', req.url));
        }
        return NextResponse.next();
      }
    }
  }
});

export const config = {
  matcher: [
    '/',
    '/app/(.*)',
    '/authorization',
    '/authorization/(.*)',
    '/success',
    '/success/(.*)',
    '/auth/(.*)',
    '/new(.*)',
    '/(api|trpc)(.*)',
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/((?!_next/static|_next/image|images|favicon.ico|$).*)',
  ],
};
