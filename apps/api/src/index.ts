import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import * as schema from './db/schema';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { cors } from 'hono/cors';
import { createClerkClient } from '@clerk/backend';
import { eq } from 'drizzle-orm';

export type Env = {
    DB: D1Database;
    MY_BUCKET: R2Bucket;
    API_KEYS: KVNamespace;
    API_KEYS_PRIVATE: KVNamespace;
    CLERK_API_KEY: string;
    ALLOWED_ORIGINS?: string;
};

const KEY_MIN_SIZE = 10;
const KEY_MAX_SIZE = 500;
const KEY_REGEX = /^[a-zA-Z0-9\-\_]+$/;

const isAlphaNumeric = (x: string): boolean => KEY_REGEX.test(x);
export const isValidKey = (x: string): boolean =>
    x.length >= KEY_MIN_SIZE && x.length <= KEY_MAX_SIZE && isAlphaNumeric(x);

const app = new Hono<{ Bindings: Env }>();

const verifyKey = async (env: Env, key?: string): Promise<Record<string, string> | null> => {
    if (!key) {
        return null;
    }

    // Limit the size of the key and reject non-alphanumeric characters.
    if (!isValidKey(key) || !key.startsWith('loc_pub_')) {
        return null;
    }

    const value: Record<string, string> | null = await env.API_KEYS.get(key, { type: 'json' });

    if (!value) {
        return null;
    }
    // response.cf.cacheEverything = true;
    return value;
};

const verifyAuthKey = async (env: Env, key?: string): Promise<Record<string, string> | null> => {
    if (!key) {
        return null;
    }

    // Limit the size of the key and reject non-alphanumeric characters.
    if (!isValidKey(key) || !key.startsWith('loc_auth_')) {
        return null;
    }

    const value: Record<string, string> | null = await env.API_KEYS_PRIVATE.get(key, { type: 'json' });

    if (!value) {
        return null;
    }
    // response.cf.cacheEverything = true;
    return value;
};

const verifyAuthToken = async (env: Env, userId?: string) => {
    //If there is no session token, return null
    if (!userId) {
        return { session: null };
    }

    const clerk = createClerkClient({ secretKey: env.CLERK_API_KEY });

    // otherwise, get the session
    const user = await clerk.users.getUser(userId);
    return {
        user,
    };
};

app.use(
    '/workspace/*',
    cors({
        origin: ['https://locless.com', 'http://localhost:3000'],
        allowHeaders: ['x-api-key', 'Content-Type', 'authorization'],
        allowMethods: ['POST', 'GET', 'PUT', 'DELETE'],
        maxAge: 86400,
    })
);

app.get('/workspace/:tenantId', async c => {
    const userId = c.req.header('authorization');
    const res = await verifyAuthToken(c.env, userId);
    if (!res.user) {
        return c.text('Invalid Auth Token', 400);
    }

    const { tenantId } = await c.req.param();
    const db = drizzle(c.env.DB, { schema });
    const result = await db.query.workspaces.findFirst({
        where: (workspaces, { eq }) => eq(workspaces.tenantId, tenantId),
    });

    if (!result) {
        return c.text('Workspace not found', 404);
    }

    return c.json(result);
});

app.use(
    '/projects/*',
    cors({
        origin: ['https://locless.com', 'http://localhost:3000'],
        allowHeaders: ['x-api-key', 'Content-Type', 'authorization'],
        allowMethods: ['POST', 'GET', 'PUT', 'DELETE'],
        maxAge: 86400,
    })
);

app.use(
    '/components/*',
    cors({
        origin: ['https://locless.com', 'http://localhost:3000'],
        allowHeaders: ['x-api-key', 'Content-Type', 'authorization'],
        allowMethods: ['POST', 'GET', 'PUT', 'DELETE'],
        maxAge: 86400,
    })
);

app.get('/projects/getAll/:workspaceId', async c => {
    const userId = c.req.header('authorization');
    const res = await verifyAuthToken(c.env, userId);
    if (!res.user) {
        return c.text('Invalid Auth Token', 400);
    }

    const { offset } = await c.req.query();
    const { workspaceId } = await c.req.param();

    if (workspaceId) {
        const db = drizzle(c.env.DB, { schema });
        const result = await db.query.projects.findMany({
            limit: 20,
            offset: parseInt(offset),
            where: (projects, { eq }) => eq(projects.workspaceId, workspaceId),
            columns: {
                id: true,
                name: true,
            },
        });
        return c.json(result);
    }

    return c.text('WorkspaceId not found', 404);
});

app.get('/projects/:projectId', async c => {
    const userId = c.req.header('authorization');
    const res = await verifyAuthToken(c.env, userId);
    if (!res.user) {
        return c.text('Invalid Auth Token', 400);
    }

    const { projectId } = await c.req.param();
    const db = drizzle(c.env.DB, { schema });
    const result = await db.query.projects.findFirst({
        where: (projects, { eq }) => eq(projects.id, projectId),
    });

    if (!result) {
        return c.text('Project not found', 404);
    }

    return c.json(result);
});

app.get('/components', async c => {
    const userId = c.req.header('authorization');
    const res = await verifyAuthToken(c.env, userId);
    if (!res.user) {
        return c.text('Invalid Auth Token', 400);
    }

    const { offset, projectId } = await c.req.query();
    const db = drizzle(c.env.DB, { schema });
    const result = await db.query.components.findMany({
        limit: 20,
        offset: parseInt(offset),
        where: (components, { eq }) => eq(components.projectId, projectId),
        columns: {
            id: true,
            name: true,
        },
    });
    return c.json(result);
});

app.get('/components/:componentId', async c => {
    const userId = c.req.header('authorization');
    const res = await verifyAuthToken(c.env, userId);
    if (!res.user) {
        return c.text('Invalid Auth Token', 400);
    }

    const { componentId } = await c.req.param();
    const db = drizzle(c.env.DB, { schema });
    const result = await db.query.components.findFirst({
        where: (components, { eq }) => eq(components.id, componentId),
    });

    if (!result) {
        return c.text('Component not found', 404);
    }

    return c.json(result);
});

app.get('/file/:componentId', async c => {
    const apiKeyPublic = c.req.header('x-api-key');
    const metaDataKey = await verifyKey(c.env, apiKeyPublic);

    if (!metaDataKey) {
        return c.text('Invalid Api Key', 400);
    }

    const { componentId } = await c.req.param();
    const db = drizzle(c.env.DB, { schema });
    const result = await db.query.components.findFirst({
        where: (components, { eq }) => eq(components.id, componentId),
    });

    if (!result) {
        return c.text('Component not found', 404);
    }

    const object = await c.env.MY_BUCKET.get(componentId);

    if (!object) {
        return c.text("File doesn't exists", 404);
    }

    object.writeHttpMetadata(c.res.headers);
    c.res.headers.set('etag', object.httpEtag);

    return c.body(object.body, 201);
});

app.post('/workspace', async c => {
    const userId = c.req.header('authorization');
    const res = await verifyAuthToken(c.env, userId);
    if (!res.user) {
        return c.text('Invalid Auth Token', 400);
    }

    const { name, tenantId, plan, isPersonal } = await c.req.json();
    const db = drizzle(c.env.DB, { schema });
    const result = await db
        .insert(schema.workspaces)
        .values({
            name,
            tenantId,
            plan,
            isPersonal,
        })
        .returning();
    return c.json(result);
});

app.post('/projects', async c => {
    const userId = c.req.header('authorization');
    const res = await verifyAuthToken(c.env, userId);
    if (!res.user) {
        return c.text('Invalid Auth Token', 400);
    }

    const { name, workspaceId } = await c.req.json();
    const db = drizzle(c.env.DB, { schema });
    const result = await db
        .insert(schema.projects)
        .values({
            name,
            workspaceId,
        })
        .returning();
    return c.json(result);
});

app.post('/generate', async c => {
    const apiKeyPrivate = c.req.header('x-api-key');
    const metaDataKey = await verifyAuthKey(c.env, apiKeyPrivate);

    if (!metaDataKey) {
        return c.text('Invalid Api Key', 400);
    }

    const formData = await c.req.formData();
    const file: any = formData.get('file');
    const name = formData.get('name');
    const componentId = formData.get('componentId');
    const projectId = metaDataKey['projectId'];

    if (file && file instanceof File && name && projectId) {
        const db = drizzle(c.env.DB, { schema });

        const ext = file.name.split('.').pop();

        const path = `${projectId}/${name}.${ext}`;

        let result;

        if (componentId) {
            result = await db
                .update(schema.components)
                .set({
                    name,
                    size: file.size,
                    fileUrl: path,
                })
                .where(eq(schema.components.id, componentId))
                .returning();
        } else {
            result = await db
                .insert(schema.components)
                .values({
                    name,
                    projectId,
                    size: file.size,
                    fileUrl: path,
                })
                .returning();
        }

        if (result[0]) {
            if (componentId) {
                await c.env.MY_BUCKET.delete(componentId);
            }

            await c.env.MY_BUCKET.put(result[0].id, file);
        } else {
            return c.text("Couldn't create a component", 500);
        }

        return c.json(result);
    } else {
        return c.text('Invalid file', 400);
    }
});

app.delete('/workspace/:workspaceId', async c => {
    const userId = c.req.header('authorization');
    const res = await verifyAuthToken(c.env, userId);
    if (!res.user) {
        return c.text('Invalid Auth Token', 400);
    }

    const { workspaceId } = await c.req.param();
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.workspaces).where(eq(schema.workspaces.id, workspaceId));

    return c.text('Workspace was deleted!', 200);
});

app.delete('/projects/:projectId', async c => {
    const userId = c.req.header('authorization');
    const res = await verifyAuthToken(c.env, userId);
    if (!res.user) {
        return c.text('Invalid Auth Token', 400);
    }

    const { projectId } = await c.req.param();
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.projects).where(eq(schema.projects.id, projectId)); // TODO: delete KV keys after project removal

    return c.text('Project was deleted!', 200);
});

app.delete('/components/:componentId', async c => {
    const userId = c.req.header('authorization');
    const res = await verifyAuthToken(c.env, userId);
    if (!res.user) {
        return c.text('Invalid Auth Token', 400);
    }

    const { componentId } = await c.req.param();
    const db = drizzle(c.env.DB, { schema });
    const deletedIds: { id: string }[] = await db
        .delete(schema.components)
        .where(eq(schema.components.id, componentId))
        .returning({ id: schema.components.id });

    if (deletedIds?.length > 0) {
        for (const item of deletedIds) {
            if (item.id) {
                await c.env.MY_BUCKET.delete(item.id);
            }
        }
    }

    return c.text('Component was deleted!', 200);
});

app.put('/projects', async c => {
    const userId = c.req.header('authorization');
    const res = await verifyAuthToken(c.env, userId);
    if (!res.user) {
        return c.text('Invalid Auth Token', 400);
    }

    const { projectId, name } = await c.req.json();
    const db = drizzle(c.env.DB, { schema });
    const result = await db
        .update(schema.projects)
        .set({
            name,
        })
        .where(eq(schema.projects.id, projectId))
        .returning();

    return c.json(result);
});

// API KEYS //

app.use(
    '/keys/*',
    cors({
        origin: ['https://locless.com', 'http://localhost:3000'],
        allowHeaders: ['x-api-key', 'Content-Type', 'authorization'],
        allowMethods: ['POST', 'GET', 'PUT', 'DELETE'],
        maxAge: 86400,
    })
);

app.get('/keys/:projectId', async c => {
    const userId = c.req.header('authorization');
    const res = await verifyAuthToken(c.env, userId);
    if (!res.user) {
        return c.text('Invalid Auth Token', 400);
    }

    const { projectId } = c.req.param();

    const publicKeyPrefix = `loc_pub_${projectId}_`;
    const privateKeyPrefix = `loc_auth_${projectId}_`;

    const publicKey = await c.env.API_KEYS.list({ prefix: publicKeyPrefix });
    const privateKey = await c.env.API_KEYS_PRIVATE.list({ prefix: privateKeyPrefix });

    if (!publicKey?.keys?.length || !privateKey.keys?.length) {
        return c.text('Keys not found', 404);
    }

    return c.json(
        {
            publicKey: publicKey.keys[0].name,
            privateKey: privateKey.keys[0].name,
        },
        201
    );
});

app.post('/keys/generate', async c => {
    const userId = c.req.header('authorization');
    const res = await verifyAuthToken(c.env, userId);
    if (!res.user) {
        return c.text('Invalid Auth Token', 400);
    }

    const { tenantId, projectId } = await c.req.json();

    if (!tenantId || !projectId) {
        return c.text('Invalid Params', 404);
    }

    const publicKey = `loc_pub_${projectId}_${crypto.randomUUID()}`;
    const privateKey = `loc_auth_${projectId}_${crypto.randomUUID()}`;

    await c.env.API_KEYS.put(
        publicKey,
        JSON.stringify({
            tenantId,
            projectId,
        })
    );

    await c.env.API_KEYS_PRIVATE.put(
        privateKey,
        JSON.stringify({
            tenantId,
            projectId,
        })
    );

    return c.json(
        {
            publicKey,
            privateKey,
        },
        201
    );
});

app.post(
    '/keys/public',
    zValidator(
        'form',
        z.object({
            tenantId: z.string(),
            projectId: z.string(),
        })
    ),
    async c => {
        const userId = c.req.header('authorization');
        const res = await verifyAuthToken(c.env, userId);
        if (!res.user) {
            return c.text('Invalid Auth Token', 400);
        }

        const { tenantId, projectId } = c.req.valid('form');

        const publicKey = `loc_pub_${projectId}_${crypto.randomUUID()}`;

        await c.env.API_KEYS.put(
            publicKey,
            JSON.stringify({
                tenantId,
                projectId,
            })
        );

        return c.json(
            {
                publicKey,
            },
            201
        );
    }
);

app.put(
    '/keys/public',
    zValidator(
        'form',
        z.object({
            key: z.string(),
            tenantId: z.string(),
            projectId: z.string(),
        })
    ),
    async c => {
        const userId = c.req.header('authorization');
        const res = await verifyAuthToken(c.env, userId);
        if (!res.user) {
            return c.text('Invalid Auth Token', 400);
        }

        const { key, tenantId, projectId } = c.req.valid('form');

        await c.env.API_KEYS.delete(key);

        const publicKey = `loc_pub_${projectId}_${crypto.randomUUID()}`;

        await c.env.API_KEYS.put(
            publicKey,
            JSON.stringify({
                tenantId,
                projectId,
            })
        );

        return c.json(
            {
                publicKey,
            },
            201
        );
    }
);

app.post(
    '/keys/private',
    zValidator(
        'form',
        z.object({
            tenantId: z.string(),
            projectId: z.string(),
        })
    ),
    async c => {
        const userId = c.req.header('authorization');
        const res = await verifyAuthToken(c.env, userId);
        if (!res.user) {
            return c.text('Invalid Auth Token', 400);
        }

        const { tenantId, projectId } = c.req.valid('form');

        const privateKey = `loc_auth_${projectId}_${crypto.randomUUID()}`;

        await c.env.API_KEYS_PRIVATE.put(
            privateKey,
            JSON.stringify({
                tenantId,
                projectId,
            })
        );

        return c.json(
            {
                privateKey,
            },
            201
        );
    }
);

app.put(
    '/keys/public',
    zValidator(
        'form',
        z.object({
            key: z.string(),
            tenantId: z.string(),
            projectId: z.string(),
        })
    ),
    async c => {
        const userId = c.req.header('authorization');
        const res = await verifyAuthToken(c.env, userId);
        if (!res.user) {
            return c.text('Invalid Auth Token', 400);
        }

        const { key, tenantId, projectId } = c.req.valid('form');

        await c.env.API_KEYS_PRIVATE.delete(key);

        const privateKey = `loc_auth_${projectId}_${crypto.randomUUID()}`;

        await c.env.API_KEYS_PRIVATE.put(
            privateKey,
            JSON.stringify({
                tenantId,
                projectId,
            })
        );

        return c.json(
            {
                privateKey,
            },
            201
        );
    }
);

export default app;
