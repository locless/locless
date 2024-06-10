import { Hono } from 'hono';
import { createConnection, schema } from './db';
import { UTApi } from 'uploadthing/server';
import { newId } from '@repo/id';
import { eq } from 'drizzle-orm';
import { OpenMeter } from '@openmeter/sdk';

export type Env = {
  MY_BUCKET: R2Bucket;
  CLERK_API_KEY: string;
  DATABASE_HOST: string;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  UPLOADTHING_SECRET: string;
  OPEN_METER_TOKEN: string;
};

const app = new Hono<{ Bindings: Env }>();

type Subscription = {
  api_requests_total: number;
  active_components_total: number;
};

const hasEnoughApiRequests = (api_requests_total = 0, plan: 'hobby' | 'pro' | 'free' | 'enterprise') => {
  if (plan === 'free' && api_requests_total + 1 <= 1000) {
    return true;
  }

  if (plan === 'hobby' || plan === 'pro' || plan === 'enterprise') {
    return true;
  }

  return false;
};

const hasEnoughActiveComponents = (active_components_total = 0, plan: 'hobby' | 'pro' | 'free' | 'enterprise') => {
  if (plan === 'free' && active_components_total + 1 <= 5) {
    return true;
  }

  if (plan === 'hobby' || plan === 'pro' || plan === 'enterprise') {
    return true;
  }

  return false;
};

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

  if (
    !hasEnoughApiRequests((project.workspace.subscriptions as Subscription)?.api_requests_total, project.workspace.plan)
  ) {
    return c.text('Too many requests', 429);
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

  if (project.workspace.plan !== 'free' && project.workspace.stripeCustomerId) {
    const openmeter = new OpenMeter({
      baseUrl: 'https://openmeter.cloud',
      token: c.env.OPEN_METER_TOKEN,
    });

    await openmeter.events.ingest({
      source: 'locless-api',
      type: 'request',
      time: new Date(),
      subject: project.workspace.stripeCustomerId,
      data: {
        value: '1',
      },
    });
  }

  const subscriptions = (project.workspace.subscriptions as Subscription) ?? {
    api_requests_total: 0,
    active_components_total: 0,
  };

  const { api_requests_total } = subscriptions;

  await db
    .update(schema.workspaces)
    .set({
      subscriptions: {
        ...subscriptions,
        api_requests_total: api_requests_total + 1,
      },
    })
    .where(eq(schema.workspaces.id, project.workspace.id));

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

  if (
    !hasEnoughApiRequests((project.workspace.subscriptions as Subscription)?.api_requests_total, project.workspace.plan)
  ) {
    return c.text('Too many requests', 429);
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
        if (
          !hasEnoughActiveComponents(
            (project.workspace.subscriptions as Subscription)?.active_components_total,
            project.workspace.plan
          )
        ) {
          return c.text('Too many components', 429);
        }

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

      if (project.workspace.plan !== 'free' && project.workspace.stripeCustomerId) {
        const openmeter = new OpenMeter({
          baseUrl: 'https://openmeter.cloud',
          token: c.env.OPEN_METER_TOKEN,
        });

        await openmeter.events.ingest({
          source: 'locless-api',
          type: 'request',
          time: new Date(),
          subject: project.workspace.stripeCustomerId,
          data: {
            value: '1',
          },
        });

        if (!component) {
          await openmeter.events.ingest({
            source: 'locless-api',
            type: 'active_component',
            time: new Date(),
            subject: project.workspace.stripeCustomerId,
            data: {
              value: '1',
            },
          });
        }
      }

      const subscriptions = (project.workspace.subscriptions as Subscription) ?? {
        api_requests_total: 0,
        active_components_total: 0,
      };

      const { api_requests_total, active_components_total } = subscriptions;

      await db
        .update(schema.workspaces)
        .set({
          subscriptions: {
            ...subscriptions,
            api_requests_total: api_requests_total + 1,
            active_components_total: component ? active_components_total : active_components_total + 1,
          },
        })
        .where(eq(schema.workspaces.id, project.workspace.id));

      if (result) {
        return c.json(result);
      }
    }
  }

  return c.text('Invalid file', 400);
});

export default app;
