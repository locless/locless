import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type LoclessConfig = {
  preloadArray?: string[];
  apiKey: string;
};

interface Props extends PropsWithChildren {
  config: LoclessConfig;
}

const queryClient = new QueryClient();

const LoclessProvider = ({ children, config: { preloadArray, apiKey } }: Props) => {
  axios.defaults.headers['x-api-key'] = apiKey;

  useEffect(() => {
    (async () => {
      if (preloadArray && preloadArray.length > 0) {
        for (const item of preloadArray) {
          await queryClient.prefetchQuery({
            queryKey: [`${item}`],
            queryFn: async ({ queryKey }) => {
              const result = await axios({
                url: `https://api.locless.com/file/${queryKey[0]}`,
                method: 'get',
              });
              const { data } = result;
              return data;
            },
          });
        }
      }
    })();
  }, [preloadArray]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default LoclessProvider;
