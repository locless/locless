import { drizzle } from 'drizzle-orm/planetscale-serverless';

import { Client } from '@planetscale/database';
import { schema } from '@repo/db';
import { Env } from '.';

export function createConnection(env: Env) {
  return drizzle(
    new Client({
      host: env.DATABASE_HOST,
      username: env.DATABASE_USERNAME,
      password: env.DATABASE_PASSWORD,
      fetch: (url: string, init: any) => {
        (init as any).cache = undefined; // Remove cache header
        const u = new URL(url);
        // set protocol to http if localhost for CI testing
        if (u.host.includes('localhost')) {
          u.protocol = 'http';
        }

        let err: Error | undefined = undefined;
        for (let i = 0; i <= 3; i++) {
          try {
            return fetch(u, init);
          } catch (e) {
            err = e as Error;
          }
        }
        throw err;
      },
    }),
    {
      schema,
    }
  );
}

export * from '@repo/db';
