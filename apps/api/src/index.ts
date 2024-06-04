import { Hono } from 'hono';
import { createConnection, schema } from './db';
import { UTApi } from 'uploadthing/server';
import { newId } from '@repo/id';
import { eq } from 'drizzle-orm';

export type Env = {
  MY_BUCKET: R2Bucket;
  CLERK_API_KEY: string;
  DATABASE_HOST: string;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  UPLOADTHING_SECRET: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/file/:name', async c => {
  const apiKeyPublic = c.req.header('x-api-key');

  if (!apiKeyPublic) {
    return c.text('Invalid Api Key', 400);
  }

  const db = createConnection(c.env);

  const project = await db.query.projects.findFirst({
    where: (projects, { eq }) => eq(projects.keyPublic, apiKeyPublic),
  });

  if (!project) {
    return c.text('Invalid Api Key', 400);
  }

  const { name } = await c.req.param();

  const component = await db.query.components.findFirst({
    where: (components, { eq, and }) => and(eq(components.projectId, project.id), eq(components.name, name)),
  });

  if (!component) {
    return c.text('Component not found', 404);
  }

  const resp = await fetch(component.fileUrl);

  const blobVal = await resp.text();

  if (!blobVal) {
    return c.text("File doesn't exists", 404);
  }

  return c.body(blobVal, 201);
});

app.post('/generate', async c => {
  const apiKeyPrivate = c.req.header('x-api-key');

  if (!apiKeyPrivate) {
    return c.text('Invalid Api Key', 400);
  }

  const db = createConnection(c.env);

  const project = await db.query.projects.findFirst({
    where: (projects, { eq }) => eq(projects.keyAuth, apiKeyPrivate),
    with: {
      workspace: true,
    },
  });

  if (!project) {
    return c.text('Invalid Api Key', 400);
  }

  const formData = await c.req.formData();
  const file: any = formData.get('file');
  const name = formData.get('name');
  let stats = formData.get('stats');

  if (stats) {
    stats = JSON.parse(stats);
  }

  if (file && file instanceof File && name && project) {
    const utapi = new UTApi({
      apiKey: c.env.UPLOADTHING_SECRET,
      fetch: (url, init): any => {
        if (init && 'cache' in init) delete init.cache;
        return fetch(url, init);
      },
    });

    let result;

    const response = await utapi.uploadFiles(file);

    if (response.data) {
      const { name, size, key, url } = response.data;

      const component = await db.query.components.findFirst({
        where: (components, { eq, and }) => and(eq(components.projectId, project.id), eq(components.name, name)),
      });

      if (component) {
        await utapi.deleteFiles([component.fileId]);

        await db
          .update(schema.components)
          .set({
            size: size,
            fileUrl: url,
            fileId: key,
          })
          .where(eq(schema.components.id, component.id));

        result = component.id;
      } else {
        const newComponentId = newId('component');

        await db.insert(schema.components).values({
          id: newComponentId,
          name,
          projectId: project.id,
          workspaceId: project.workspace.id,
          size: size,
          fileUrl: url,
          fileId: key,
          createdAt: new Date(),
          deletedAt: null,
          enabled: true,
          canReverseDeletion: true,
          stats,
        });

        result = newComponentId;
      }

      if (result) {
        return c.json(result);
      }
    }
  }

  return c.text('Invalid file', 400);
});

export default app;
