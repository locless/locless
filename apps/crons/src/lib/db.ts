import { env } from './env';

import { Client } from '@planetscale/database';
import { type PlanetScaleDatabase, drizzle, schema } from '@repo/db';
export type Database = PlanetScaleDatabase<typeof schema>;

export function createConnection(): Database {
  return drizzle(
    new Client({
      host: env().DATABASE_HOST,
      username: env().DATABASE_USERNAME,
      password: env().DATABASE_PASSWORD,
      fetch: (url: string, init: any) => {
        (init as any).cache = undefined; // Remove cache header
        return fetch(url, init);
      },
    }),
    {
      schema,
    }
  );
}

export * from '@repo/db';
