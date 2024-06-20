/* eslint-disable @typescript-eslint/no-explicit-any */

export const unwrapTrpcResponse = <T = any>(res: any): T => {
  return res.error ? (res.error.json as T) : (res.result.data.json as T);
};

export const unwrapBatchTrpcResponse = <T = any>(res: any, batch = 0): T => {
  return res[batch].error ? (res[batch].error.json as T) : (res[batch].result.data.json as T);
};
