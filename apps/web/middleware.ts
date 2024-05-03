import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { findWorkspace } from '@/lib/api';

const isProtectedRoute = createRouteMatcher(['/app(.*)']);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
        const { userId, orgId } = auth();
        if (!userId) {
            return auth().redirectToSignIn({ returnBackUrl: req.url });
        }

        if (orgId) {
            const workspace = await findWorkspace({ tenantId: orgId });
            // this stops users if they haven't paid.
            if (workspace && !['/settings/billing/stripe', '/app/projects', '/'].includes(req.nextUrl.pathname)) {
                if (workspace.plan === 'free') {
                    return NextResponse.redirect(new URL('/settings/billing/stripe', req.url));
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
        '/(api|trpc)(.*)',
        '/((?!.+\\.[\\w]+$|_next).*)',
        '/((?!_next/static|_next/image|images|favicon.ico|$).*)',
    ],
};
