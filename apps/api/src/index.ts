import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { createConnection, schema } from './db';

export type Env = {
  MY_BUCKET: R2Bucket;
  CLERK_API_KEY: string;
  DATABASE_HOST: string;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
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

app.get('/file/:componentId', async c => {
  const apiKeyPublic = c.req.header('x-api-key');
  const metaDataKey = await verifyKey(c.env, apiKeyPublic);

  if (!metaDataKey) {
    return c.text('Invalid Api Key', 400);
  }

  const { componentId } = await c.req.param();
  const db = createConnection(c.env);

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
    const db = createConnection(c.env);

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

export default app;
