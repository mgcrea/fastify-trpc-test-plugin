export interface AppRouter {
  procedures: string;
  input: Record<string, unknown>;
}

export type inferProcedureInput<T extends string> = T extends `${infer U}.${infer R}`
  ? U extends keyof AppRouter["input"]
    ? AppRouter["input"][U][R]
    : never
  : never;
