import { Hono } from 'hono';
import { createConnection, schema, eq } from './db';
import { UTApi } from 'uploadthing/server';
import { newId } from '@repo/id';
import { Tinybird } from '@chronark/zod-bird';
import { z } from 'zod';

const GIGABYTE = Math.pow(1024, 3);
const MAX_FREE_SIZE = 1 * GIGABYTE;

export type Env = {
  MY_BUCKET: R2Bucket;
  CLERK_API_KEY: string;
  DATABASE_HOST: string;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  UPLOADTHING_SECRET: string;
  OPEN_METER_TOKEN: string;
  TINYBIRD_TOKEN: string;
};

const app = new Hono<{ Bindings: Env }>();

const publishEventApiRequests = (tb: any) =>
  tb.buildIngestEndpoint({
    datasource: 'api_requests__v1',
    event: z.object({
      projectId: z.string(),
      componentId: z.string(),
      workspaceId: z.string(),
      deniedReason: z.string().optional(),
      time: z.number().int(),
    }),
  });

const publishEventStorageUsage = (tb: any) =>
  tb.buildIngestEndpoint({
    datasource: 'storage_usage__v1',
    event: z.object({
      projectId: z.string(),
      componentId: z.string(),
      workspaceId: z.string(),
      size: z.number().int(),
      time: z.number().int(),
    }),
  });

app.get('/file/:name', async c => {
  const apiKeyPublic = c.req.header('x-api-key');

  if (!apiKeyPublic) {
    return c.text('Invalid Api Key', 400);
  }

  const db = createConnection(c.env);

  const project = await db.query.projects.findFirst({
    where: (projects, { eq }) => eq(projects.keyPublic, apiKeyPublic),
    with: {
      workspace: true,
    },
  });

  if (!project) {
    return c.text('Invalid Api Key', 400);
  }

  if (project.workspace.isUsageExceeded) {
    return c.text('Too many requests', 429);
  }

  const { name } = await c.req.param();

  const component = await db.query.components.findFirst({
    where: (components, { eq, and }) => and(eq(components.projectId, project.id), eq(components.name, name)),
  });

  if (!component || !component?.enabled) {
    return c.text('Component not found', 404);
  }

  const resp = await fetch(component.fileUrl);

  const blobVal = await resp.text();

  if (!blobVal) {
    return c.text("File doesn't exists", 404);
  }

  const tb = new Tinybird({ token: c.env.TINYBIRD_TOKEN });

  await publishEventStorageUsage(tb)({
    projectId: project.id,
    componentId: component.id,
    workspaceId: project.workspaceId,
    size: component.size,
    time: Date.now(),
  });

  await publishEventApiRequests(tb)({
    projectId: project.id,
    componentId: component.id,
    workspaceId: project.workspaceId,
    deniedReason: '',
    time: Date.now(),
  });

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

  if (project.workspace.isUsageExceeded) {
    return c.text('Too many requests', 429);
  }

  const formData = await c.req.formData();
  const file: any = formData.get('file');
  const name = formData.get('name');
  let stats = formData.get('stats');
  const isRecoverComponent = formData.get('recover');

  if (stats) {
    stats = JSON.parse(stats);
  }

  if (file && file instanceof File && name && project) {
    const component = await db.query.components.findFirst({
      where: (components, { eq, and }) => and(eq(components.projectId, project.id), eq(components.name, name)),
    });

    if (component?.deletedAt && !isRecoverComponent) {
      return c.json('COMPONENT_DELETED');
    }

    if (project.workspace.plan === 'free') {
      let size = project.workspace.size;

      if (component) {
        size = size - component.size + file.size;
      } else {
        size = size + file.size;
      }

      if (size > MAX_FREE_SIZE) {
        return c.text('Size limit exceeded', 429);
      }
    }

    let result;

    const utapi = new UTApi({
      apiKey: c.env.UPLOADTHING_SECRET,
      fetch: (url, init): any => {
        if (init && 'cache' in init) delete init.cache;
        return fetch(url, init);
      },
    });

    const response = await utapi.uploadFiles(file);

    if (response.data) {
      const { name, size, key, url } = response.data;

      if (component) {
        await utapi.deleteFiles([component.fileId]);

        await db.transaction(async tx => {
          await tx
            .update(schema.components)
            .set({
              size: size,
              fileUrl: url,
              fileId: key,
              deletedAt: null,
            })
            .where(eq(schema.components.id, component.id));

          await tx
            .update(schema.workspaces)
            .set({
              size: project.workspace.size - component.size + size,
            })
            .where(eq(schema.workspaces.id, project.workspaceId));
        });

        result = component.id;
      } else {
        const newComponentId = newId('component');

        await db.transaction(async tx => {
          await tx.insert(schema.components).values({
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

          await tx
            .update(schema.workspaces)
            .set({
              size: project.workspace.size + size,
            })
            .where(eq(schema.workspaces.id, project.workspaceId));
        });

        result = newComponentId;
      }

      if (result) {
        const tb = new Tinybird({ token: c.env.TINYBIRD_TOKEN });

        await publishEventStorageUsage(tb)({
          projectId: project.id,
          componentId: result,
          workspaceId: project.workspaceId,
          size: size,
          time: Date.now(),
        });

        await publishEventApiRequests(tb)({
          projectId: project.id,
          componentId: result,
          workspaceId: project.workspaceId,
          deniedReason: '',
          time: Date.now(),
        });

        return c.json(result);
      }
    }
  }

  return c.text('Invalid file', 400);
});

export default app;
