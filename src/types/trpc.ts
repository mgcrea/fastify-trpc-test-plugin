import type { AnyRouter, inferRouterInputs } from "@trpc/server";

export type UnknownProcedures = string;
export type UnknownRouterInputs = Record<string, Record<string, unknown>>;

// export type inferProcedureInput<
//   T extends string,
//   R extends UnknownRouterInput,
// > = T extends `${infer N}.${infer M}` ? (N extends keyof R ? R[N][M] : never) : never;

type PrefixedKeys<T, U extends string | number | symbol> = T extends string
  ? U extends string | number
    ? `${U}.${T}`
    : never
  : never;

export type ExtractProcedurePaths<T, K extends string | number | symbol> = K extends keyof T
  ? PrefixedKeys<keyof T[K], K>
  : never;

export type inferRouterProcedures<TRouter extends AnyRouter> = ExtractProcedurePaths<
  TRouter,
  keyof TRouter["_def"]["procedures"]
>;

export type inferProcedureInput<
  TRouter extends AnyRouter,
  P extends UnknownProcedures = inferRouterProcedures<TRouter>,
  I extends UnknownRouterInputs = inferRouterInputs<TRouter>,
> = P extends `${infer N}.${infer M}` ? (N extends keyof I ? I[N][M] : never) : never;
