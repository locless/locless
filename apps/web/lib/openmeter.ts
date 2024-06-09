import { OpenMeter } from '@openmeter/sdk';

import { env } from './env';

export const openmeter = new OpenMeter({
  baseUrl: 'https://openmeter.cloud',
  token: env()!.OPEN_METER_TOKEN,
});
