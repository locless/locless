import { Hono } from 'hono';
import { createConnection, schema } from './db';
import { UTApi } from 'uploadthing/server';
import { newId } from '@repo/id';
import { eq } from 'drizzle-orm';
import dayjs from 'dayjs';

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
  api_requests_monthly: number;
  active_components_monthly: number;
};

const DEFAULT_SUBSCRIPTIONS: Subscription = {
  api_requests_total: 0,
  active_components_total: 0,
  api_requests_monthly: 0,
  active_components_monthly: 0,
};

const ingestOpenMeterEvent = async (stripeCustomerId: string, token: string, eventName: string, data: any) => {
  await fetch('https://openmeter.cloud/api/v1/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/cloudevents+json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      source: 'locless-api',
      type: eventName,
      time: new Date(),
      subject: stripeCustomerId,
      data,
      specversion: '1.0',
    }),
  });
};

const hasEnoughApiRequests = (api_requests_monthly = 0, plan: 'hobby' | 'pro' | 'free' | 'enterprise') => {
  if (plan === 'free' && api_requests_monthly + 1 <= 1000) {
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

  const isMonthPassed = dayjs().isBefore(dayjs(project.workspace.refilledAt), 'month');

  if (
    !isMonthPassed &&
    !hasEnoughApiRequests(
      (project.workspace.subscriptions as Subscription)?.api_requests_monthly,
      project.workspace.plan
    )
  ) {
    return c.text('Too many requests', 429);
  }

  const subscriptions = (project.workspace.subscriptions as Subscription) ?? DEFAULT_SUBSCRIPTIONS;

  const { api_requests_total, api_requests_monthly } = subscriptions;

  await db
    .update(schema.workspaces)
    .set({
      refilledAt: isMonthPassed ? new Date() : project.workspace.refilledAt,
      subscriptions: {
        ...subscriptions,
        api_requests_total: api_requests_total + 1,
        api_requests_monthly: isMonthPassed ? 1 : api_requests_monthly + 1,
      },
    })
    .where(eq(schema.workspaces.id, project.workspace.id));

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
    await ingestOpenMeterEvent(project.workspace.stripeCustomerId, c.env.OPEN_METER_TOKEN, 'request', {
      value: '1',
    });
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

  const isMonthPassed = dayjs().isBefore(dayjs(project.workspace.refilledAt), 'month');

  if (
    !isMonthPassed &&
    !hasEnoughApiRequests(
      (project.workspace.subscriptions as Subscription)?.api_requests_monthly,
      project.workspace.plan
    )
  ) {
    return c.text('Too many requests', 429);
  }

  const subscriptions = (project.workspace.subscriptions as Subscription) ?? DEFAULT_SUBSCRIPTIONS;

  const { api_requests_total, api_requests_monthly } = subscriptions;

  const newSubscriptions = {
    ...subscriptions,
    api_requests_total: api_requests_total + 1,
    api_requests_monthly: isMonthPassed ? 1 : api_requests_monthly + 1,
  };

  await db
    .update(schema.workspaces)
    .set({
      refilledAt: isMonthPassed ? new Date() : project.workspace.refilledAt,
      subscriptions: newSubscriptions,
    })
    .where(eq(schema.workspaces.id, project.workspace.id));

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
        await ingestOpenMeterEvent(project.workspace.stripeCustomerId, c.env.OPEN_METER_TOKEN, 'request', {
          value: '1',
        });

        if (!component) {
          await ingestOpenMeterEvent(project.workspace.stripeCustomerId, c.env.OPEN_METER_TOKEN, 'active_component', {
            value: '1',
          });
        }
      }

      const { active_components_total, active_components_monthly } = newSubscriptions;

      await db
        .update(schema.workspaces)
        .set({
          subscriptions: {
            ...newSubscriptions,
            active_components_monthly: (isMonthPassed ? 0 : active_components_monthly) + (component ? 0 : 1),
            active_components_total: active_components_total + (component ? 0 : 1),
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
