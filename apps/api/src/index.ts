import { Hono } from 'hono';
import { createConnection, schema, eq, isNull } from './db';
import { UTApi } from 'uploadthing/server';
import { newId } from '@repo/id';
import { Tinybird } from '@chronark/zod-bird';
import { z } from 'zod';
import isLocale from './utils/isLocale';
import { verifyKey } from '@unkey/api';

const GIGABYTE = Math.pow(1024, 3);
const MAX_FREE_SIZE = 1 * GIGABYTE;

export type Env = {
  DATABASE_HOST: string;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  UPLOADTHING_SECRET: string;
  TINYBIRD_TOKEN: string;
  UNKEY_API_ID: string;
};

const app = new Hono<{ Bindings: Env }>();

const publishEventApiRequests = (tb: any) =>
  tb.buildIngestEndpoint({
    datasource: 'api_requests__v1',
    event: z.object({
      projectId: z.string(),
      elementId: z.string(),
      type: z.string(),
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
      elementId: z.string(),
      type: z.string(),
      workspaceId: z.string(),
      size: z.number().int(),
      time: z.number().int(),
    }),
  });

app.get('/translations-pull', async c => {
  const apiKeyPrivate = c.req.header('x-api-key');

  if (!apiKeyPrivate) {
    return c.text('Invalid Api Key', 400);
  }

  const { result, error } = await verifyKey({
    key: apiKeyPrivate,
    apiId: c.env.UNKEY_API_ID,
  });

  if (error) {
    return c.text('Invalid Api Key', 400);
  }

  if (!result.valid) {
    return c.text('Invalid Api Key', 400);
  }

  if (!result.permissions?.includes('api.private_key')) {
    return c.text('Invalid Api Key', 400);
  }

  const projectId = result.ownerId;

  if (!projectId) {
    return c.text('Invalid Api Key', 400);
  }

  const db = createConnection(c.env);

  const project = await db.query.projects.findFirst({
    where: (projects, { eq, and }) => and(eq(projects.id, projectId), isNull(projects.deletedAt)),
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

  const translations = await db.query.translations.findMany({
    where: (translations, { eq }) => eq(translations.projectId, project.id),
    columns: {
      id: true,
      name: true,
      updatedAt: true,
    },
  });

  const tb = new Tinybird({ token: c.env.TINYBIRD_TOKEN });

  await publishEventApiRequests(tb)({
    projectId: project.id,
    elementId: 'translations-pull',
    type: 'translation',
    workspaceId: project.workspaceId,
    deniedReason: '',
    time: Date.now(),
  });

  return c.json(translations);
});

app.get('/translations-id/:id', async c => {
  const apiKeyPrivate = c.req.header('x-api-key');

  if (!apiKeyPrivate) {
    return c.text('Invalid Api Key', 400);
  }

  const { result, error } = await verifyKey({
    key: apiKeyPrivate,
    apiId: c.env.UNKEY_API_ID,
  });

  if (error) {
    return c.text('Invalid Api Key', 400);
  }

  if (!result.valid) {
    return c.text('Invalid Api Key', 400);
  }

  if (!result.permissions?.includes('api.private_key')) {
    return c.text('Invalid Api Key', 400);
  }

  const projectId = result.ownerId;

  if (!projectId) {
    return c.text('Invalid Api Key', 400);
  }

  const { id } = await c.req.param();

  const db = createConnection(c.env);

  const project = await db.query.projects.findFirst({
    where: (projects, { eq, and }) => and(eq(projects.id, projectId), isNull(projects.deletedAt)),
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

  const translation = await db.query.translations.findFirst({
    where: (translations, { eq, and }) => and(eq(translations.id, id), isNull(translations.deletedAt)),
  });

  if (!translation || !translation?.enabled) {
    return c.text('Translation not found', 404);
  }

  const resp = await fetch(translation.fileUrl);

  const blobVal = await resp.text();

  if (!blobVal) {
    return c.text("File doesn't exists", 404);
  }

  const tb = new Tinybird({ token: c.env.TINYBIRD_TOKEN });

  await publishEventStorageUsage(tb)({
    projectId: project.id,
    elementId: translation.id,
    type: 'translation',
    workspaceId: project.workspaceId,
    size: translation.size,
    time: Date.now(),
  });

  await publishEventApiRequests(tb)({
    projectId: project.id,
    elementId: translation.id,
    type: 'translation',
    workspaceId: project.workspaceId,
    deniedReason: '',
    time: Date.now(),
  });

  return c.body(blobVal, 201);
});

app.get('/translations/:name', async c => {
  const apiKeyPublic = c.req.header('x-api-key');

  if (!apiKeyPublic) {
    return c.text('Invalid Api Key', 400);
  }

  const { result, error } = await verifyKey({
    key: apiKeyPublic,
    apiId: c.env.UNKEY_API_ID,
  });

  if (error) {
    return c.text('Invalid Api Key', 400);
  }

  if (!result.valid) {
    return c.text('Invalid Api Key', 400);
  }

  if (!result.permissions?.includes('api.public_key')) {
    return c.text('Invalid Api Key', 400);
  }

  const projectId = result.ownerId;

  if (!projectId) {
    return c.text('Invalid Api Key', 400);
  }

  const { name } = await c.req.param();

  if (!isLocale(name)) {
    return c.text('Invalid locale', 400);
  }

  const db = createConnection(c.env);

  const project = await db.query.projects.findFirst({
    where: (projects, { eq, and }) => and(eq(projects.id, projectId), isNull(projects.deletedAt)),
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

  const translation = await db.query.translations.findFirst({
    where: (translations, { eq, and }) =>
      and(eq(translations.projectId, project.id), eq(translations.name, name), isNull(translations.deletedAt)),
  });

  if (!translation || !translation?.enabled) {
    return c.text('Translation not found', 404);
  }

  const resp = await fetch(translation.fileUrl);

  const blobVal = await resp.text();

  if (!blobVal) {
    return c.text("File doesn't exists", 404);
  }

  const tb = new Tinybird({ token: c.env.TINYBIRD_TOKEN });

  await publishEventStorageUsage(tb)({
    projectId: project.id,
    elementId: translation.id,
    type: 'translation',
    workspaceId: project.workspaceId,
    size: translation.size,
    time: Date.now(),
  });

  await publishEventApiRequests(tb)({
    projectId: project.id,
    elementId: translation.id,
    type: 'translation',
    workspaceId: project.workspaceId,
    deniedReason: '',
    time: Date.now(),
  });

  return c.body(blobVal, 201);
});

app.get('/file/:name', async c => {
  const apiKeyPublic = c.req.header('x-api-key');

  if (!apiKeyPublic) {
    return c.text('Invalid Api Key', 400);
  }

  const { result, error } = await verifyKey({
    key: apiKeyPublic,
    apiId: c.env.UNKEY_API_ID,
  });

  if (error) {
    return c.text('Invalid Api Key', 400);
  }

  if (!result.valid) {
    return c.text('Invalid Api Key', 400);
  }

  if (!result.permissions?.includes('api.public_key')) {
    return c.text('Invalid Api Key', 400);
  }

  const projectId = result.ownerId;

  if (!projectId) {
    return c.text('Invalid Api Key', 400);
  }

  const db = createConnection(c.env);

  const project = await db.query.projects.findFirst({
    where: (projects, { eq, and }) => and(eq(projects.id, projectId), isNull(projects.deletedAt)),
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
    where: (components, { eq, and }) =>
      and(eq(components.projectId, project.id), eq(components.name, name), isNull(components.deletedAt)),
  });

  if (!component) {
    return c.text('Component not found', 404);
  }

  if (!component?.enabled) {
    return c.body('null', 201);
  }

  const resp = await fetch(component.fileUrl);

  const blobVal = await resp.text();

  if (!blobVal) {
    return c.text("File doesn't exists", 404);
  }

  const tb = new Tinybird({ token: c.env.TINYBIRD_TOKEN });

  await publishEventStorageUsage(tb)({
    projectId: project.id,
    elementId: component.id,
    type: 'component',
    workspaceId: project.workspaceId,
    size: component.size,
    time: Date.now(),
  });

  await publishEventApiRequests(tb)({
    projectId: project.id,
    elementId: component.id,
    type: 'component',
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

  const { result, error } = await verifyKey({
    key: apiKeyPrivate,
    apiId: c.env.UNKEY_API_ID,
  });

  if (error) {
    return c.text('Invalid Api Key', 400);
  }

  if (!result.valid) {
    return c.text('Invalid Api Key', 400);
  }

  if (!result.permissions?.includes('api.private_key')) {
    return c.text('Invalid Api Key', 400);
  }

  const projectId = result.ownerId;

  if (!projectId) {
    return c.text('Invalid Api Key', 400);
  }

  const formData = await c.req.formData();
  const name = formData.get('name');

  if (!name) {
    return c.text('Invalid name', 400);
  }

  const db = createConnection(c.env);

  const project = await db.query.projects.findFirst({
    where: (projects, { eq, and }) => and(eq(projects.id, projectId), isNull(projects.deletedAt)),
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

  const file: any = formData.get('file');
  let stats = formData.get('stats');

  if (stats) {
    stats = JSON.parse(stats);
  }

  if (file && file instanceof File && name && project) {
    const component = await db.query.components.findFirst({
      where: (components, { eq, and }) => and(eq(components.projectId, project.id), eq(components.name, name)),
    });

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
              updatedAt: new Date(),
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
        const creationDate = new Date();

        await db.transaction(async tx => {
          await tx.insert(schema.components).values({
            id: newComponentId,
            name,
            projectId: project.id,
            workspaceId: project.workspace.id,
            size: size,
            fileUrl: url,
            fileId: key,
            createdAt: creationDate,
            updatedAt: creationDate,
            deletedAt: null,
            enabled: true,
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
        await utapi.renameFiles({
          fileKey: key,
          newName: `${name}_${result}.js`,
        } as any);

        const tb = new Tinybird({ token: c.env.TINYBIRD_TOKEN });

        await publishEventStorageUsage(tb)({
          projectId: project.id,
          elementId: result,
          type: 'component',
          workspaceId: project.workspaceId,
          size: size,
          time: Date.now(),
        });

        await publishEventApiRequests(tb)({
          projectId: project.id,
          elementId: result,
          type: 'component',
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

app.post('/generate-translation', async c => {
  const apiKeyPrivate = c.req.header('x-api-key');

  if (!apiKeyPrivate) {
    return c.text('Invalid Api Key', 400);
  }

  const { result, error } = await verifyKey({
    key: apiKeyPrivate,
    apiId: c.env.UNKEY_API_ID,
  });

  if (error) {
    return c.text('Invalid Api Key', 400);
  }

  if (!result.valid) {
    return c.text('Invalid Api Key', 400);
  }

  if (!result.permissions?.includes('api.private_key')) {
    return c.text('Invalid Api Key', 400);
  }

  const projectId = result.ownerId;

  if (!projectId) {
    return c.text('Invalid Api Key', 400);
  }

  const formData = await c.req.formData();
  const name = formData.get('name');

  if (!name || !isLocale(name)) {
    return c.text('Invalid locale', 400);
  }

  const db = createConnection(c.env);

  const project = await db.query.projects.findFirst({
    where: (projects, { eq, and }) => and(eq(projects.id, projectId), isNull(projects.deletedAt)),
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

  const file: any = formData.get('file');
  let stats = formData.get('stats');
  const pulledAt = formData.get('pulledAt');

  if (stats) {
    stats = JSON.parse(stats);
  }

  if (file && file instanceof File && name && project) {
    const translation = await db.query.translations.findFirst({
      where: (translations, { eq, and }) => and(eq(translations.projectId, project.id), eq(translations.name, name)),
    });

    if (translation) {
      if (!pulledAt || !translation.updatedAt) {
        return c.json('TRANSLATION_OUTDATED');
      }

      if (new Date(pulledAt).getTime() !== translation.updatedAt.getTime()) {
        return c.json('TRANSLATION_OUTDATED');
      }
    }

    if (project.workspace.plan === 'free') {
      let size = project.workspace.size;

      if (translation) {
        size = size - translation.size + file.size;
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

    const currentDate = new Date();

    if (response.data) {
      const { name, size, key, url } = response.data;

      if (translation) {
        await utapi.deleteFiles([translation.fileId]);

        await db.transaction(async tx => {
          await tx
            .update(schema.translations)
            .set({
              size: size,
              fileUrl: url,
              fileId: key,
              deletedAt: null,
              updatedAt: currentDate,
            })
            .where(eq(schema.translations.id, translation.id));

          await tx
            .update(schema.workspaces)
            .set({
              size: project.workspace.size - translation.size + size,
            })
            .where(eq(schema.workspaces.id, project.workspaceId));
        });

        result = {
          id: translation.id,
          updatedAt: currentDate,
        };
      } else {
        const newTranslationId = newId('translation');

        await db.transaction(async tx => {
          await tx.insert(schema.translations).values({
            id: newTranslationId,
            name,
            projectId: project.id,
            workspaceId: project.workspace.id,
            size: size,
            fileUrl: url,
            fileId: key,
            createdAt: currentDate,
            updatedAt: currentDate,
            deletedAt: null,
            enabled: true,
            stats,
          });

          await tx
            .update(schema.workspaces)
            .set({
              size: project.workspace.size + size,
            })
            .where(eq(schema.workspaces.id, project.workspaceId));
        });

        result = {
          id: newTranslationId,
          updatedAt: currentDate,
        };
      }

      if (result) {
        await utapi.renameFiles({
          fileKey: key,
          newName: `${name}_${result.id}.json`,
        } as any);

        const tb = new Tinybird({ token: c.env.TINYBIRD_TOKEN });

        await publishEventStorageUsage(tb)({
          projectId: project.id,
          elementId: result.id,
          type: 'translation',
          workspaceId: project.workspaceId,
          size: size,
          time: Date.now(),
        });

        await publishEventApiRequests(tb)({
          projectId: project.id,
          elementId: result.id,
          type: 'translation',
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
