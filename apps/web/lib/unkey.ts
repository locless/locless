import { Unkey } from '@unkey/api';
import { env } from './env';

const token = env().UNKEY_ROOT_KEY!;

export const unkey_api_id = env().UNKEY_API_ID!;
export const unkey = new Unkey({ rootKey: token });
