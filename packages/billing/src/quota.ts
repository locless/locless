export type Quotas = {
  maxApiRequests: number;
  maxFileStorage: number;
  maxFileBandwidth: number;
};

export const QUOTA = {
  free: {
    maxApiRequests: 1000,
    maxFileStorage: 1,
    maxFileBandwidth: 1,
  },
} satisfies Record<string, Quotas>;
