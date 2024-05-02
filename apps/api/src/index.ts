import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import * as schema from './db/schema';

export type Env = {
    DB: D1Database;
    MY_BUCKET: R2Bucket;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/workspace/:tenantId', async c => {
    const { tenantId } = await c.req.param();
    const db = drizzle(c.env.DB, { schema });
    const result = await db.query.workspaces.findFirst({
        where: (workspaces, { eq }) => eq(workspaces.id, tenantId),
    });
    return c.json(result);
});

app.get('/projects', async c => {
    const { offset, workspaceId } = await c.req.query(); // TODO: get workspaceId from auth api key
    const db = drizzle(c.env.DB, { schema });
    const result = await db.query.projects.findMany({
        limit: 20,
        offset: parseInt(offset),
        where: (projects, { eq }) => eq(projects.workspaceId, workspaceId),
    });
    return c.json(result);
});

app.get('/projects/:projectId', async c => {
    const { projectId } = await c.req.param();
    const db = drizzle(c.env.DB, { schema });
    const result = await db.query.projects.findFirst({
        where: (projects, { eq }) => eq(projects.id, projectId),
        with: {
            components: {
                id: true,
                name: true,
            },
        },
    });
    return c.json(result);
});

app.get('/components', async c => {
    const { offset, projectId } = await c.req.query(); // TODO: get projectId from auth api key
    const db = drizzle(c.env.DB, { schema });
    const result = await db.query.components.findMany({
        limit: 20,
        offset: parseInt(offset),
        where: (components, { eq }) => eq(components.projectId, projectId),
    });
    return c.json(result);
});

app.get('/components/:componentId', async c => {
    const { componentId } = await c.req.param();
    const db = drizzle(c.env.DB, { schema });
    const result = await db.query.components.findFirst({
        where: (components, { eq }) => eq(components.id, componentId),
    });
    return c.json(result);
});

app.get('/file/:fileName', async c => {
    const { fileName } = await c.req.param();
    const object = await c.env.MY_BUCKET.get(fileName);

    if (!object) {
        return c.text("File doesn't exists", 404);
    }

    object.writeHttpMetadata(c.res.headers);
    c.res.headers.set('etag', object.httpEtag);

    return c.body(object.body, 201);
});

app.post('/workspace', async c => {
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

app.post('/components', async c => {
    const formData = await c.req.formData();
    const file: any = formData.get('file');
    const name = formData.get('name');
    const projectId = formData.get('projectId'); // TODO: take from user's API key
    /*const arr = await file.arrayBuffer();

    fs.writeFile('foo.png', Buffer.from(arr), err => {
        if (err) throw err;
    });*/

    if (file && file instanceof File && name && projectId) {
        const db = drizzle(c.env.DB, { schema });

        const ext = file.name.split('.').pop();

        const path = `${projectId}/${name}.${ext}`;
        await c.env.MY_BUCKET.put(path, file);

        const result = await db
            .insert(schema.components)
            .values({
                name,
                projectId,
                size: file.size,
                fileUrl: name,
            })
            .returning();

        console.log(file);
        console.log(name);
        return c.json(result);
    } else {
        return c.text('Invalid file', 400);
    }

    /*const { name, projectId, size, fileUrl } = await c.req.json(); // TODO: We need to parse arrived file for all metadata
    const db = drizzle(c.env.DB, { schema });
    // TODO: perform insert only after R2 upload
    const result = await db
        .insert(schema.components)
        .values({
            name,
            projectId,
            size,
            fileUrl,
        })
        .returning();
    return c.json(result);*/
});

app.delete('/workspace', async c => {
    const { id } = await c.req.json();
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.workspaces).values({
        id,
    });
});

app.delete('/projects', async c => {
    const { id } = await c.req.json();
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.projects).values({
        id,
    });
});

app.delete('/components', async c => {
    const { id } = await c.req.json();
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.components).values({
        id,
    });
});

export default app;
