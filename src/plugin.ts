/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AnyRouter } from "@trpc/server";
import type { FastifyPluginAsync, InjectOptions, LightMyRequestResponse } from "fastify";
import fastifyPlugin from "fastify-plugin";
import {
  exportHeaders,
  mergeHeaders,
  unwrapBatchTrpcResponse,
  unwrapTrpcResponse,
} from "src/utils";
import type { UnknownProcedures, inferProcedureInput, inferRouterProcedures } from "./types";

export type FastifyTrpcTestPluginOptions = {
  defaultHeaders?: Record<string, string>;
  transformer?: {
    serialize: (data: any) => string;
    stringify: (data: any) => string;
    parse: (data: string) => any;
  };
  prefix?: string;
};

export type InjectTrpcOptions<R extends AnyRouter, P extends UnknownProcedures> = Omit<
  InjectOptions,
  "method" | "url" | "body"
> & {
  input?: inferProcedureInput<R, P>;
};

const fastifyTrpcTestPlugin: FastifyPluginAsync<FastifyTrpcTestPluginOptions> = async (
  fastify,
  options,
): Promise<void> => {
  const { prefix = "", defaultHeaders = { accept: "application/json" }, transformer } = options;

  const injectTrpcQuery = async <R extends AnyRouter, P extends inferRouterProcedures<R>>(
    procedure: P,
    opts: InjectTrpcOptions<R, P> = {},
  ): Promise<LightMyRequestResponse> => {
    const { input, headers: optionsHeaders, ...rest } = opts;

    const params = new URLSearchParams();
    if (input) {
      // Serialize with transformer if provided, otherwise use JSON
      params.set(
        "input",
        transformer ? transformer.stringify(input) : JSON.stringify({ json: input }),
      );
    }
    const headers = new Headers(Object.entries(defaultHeaders));
    const url = `${prefix}/${procedure}?${params.toString()}`;
    const res = await fastify.inject({
      ...rest,
      method: "GET",
      headers: exportHeaders(mergeHeaders(headers, optionsHeaders)),
      url,
    });

    const { json: original } = res;
    res.json = <T = any>(): T => unwrapTrpcResponse(original<T>());
    return res;
  };
  fastify.decorate("injectTrpcQuery", injectTrpcQuery);

  const injectTrpcBatchQuery = async <R extends AnyRouter, P extends inferRouterProcedures<R>>(
    procedure: P,
    opts: InjectTrpcOptions<R, P> = {},
  ): Promise<LightMyRequestResponse> => {
    const { input, headers: optionsHeaders, ...rest } = opts;

    const params = new URLSearchParams([["batch", "1"]]);
    if (input) {
      params.set(
        "input",
        transformer
          ? JSON.stringify({ 0: transformer.stringify(input) })
          : JSON.stringify({ 0: { json: input } }),
      );
    }
    const headers = new Headers(Object.entries(defaultHeaders));
    const url = `${prefix}/${procedure}?${params.toString()}`;
    const res = await fastify.inject({
      ...rest,
      method: "GET",
      headers: exportHeaders(mergeHeaders(headers, optionsHeaders)),
      url,
    });

    const { json: original } = res;
    res.json = <T = any>(): T => unwrapBatchTrpcResponse(original<T>());
    return res;
  };
  fastify.decorate("injectTrpcBatchQuery", injectTrpcBatchQuery);

  const injectTrpcMutation = async <R extends AnyRouter, P extends inferRouterProcedures<R>>(
    procedure: P,
    opts: InjectTrpcOptions<R, P> = {},
  ): Promise<LightMyRequestResponse> => {
    const { input, headers: optionsHeaders, ...rest } = opts;

    const params = new URLSearchParams([["batch", "1"]]);
    const headers = new Headers(Object.entries(defaultHeaders));
    headers.set("content-type", "application/json");
    const url = `${prefix}/${procedure}?${params.toString()}`;

    const res = await fastify.inject({
      ...rest,
      method: "POST",
      url,
      headers: exportHeaders(mergeHeaders(headers, optionsHeaders)),
      body: { 0: transformer ? transformer.serialize(input) : { json: JSON.stringify(input) } },
    });

    const { json: original } = res;
    res.json = <T = any>(): T => unwrapBatchTrpcResponse(original<T>());
    return res;
  };
  fastify.decorate("injectTrpcMutation", injectTrpcMutation);
};

export const fastifyTrpcTest = fastifyPlugin(fastifyTrpcTestPlugin);

// declare module "fastify" {
//   interface FastifyInstance {
//     injectTrpcQuery: <R extends AnyRouter, P extends inferRouterProcedures<R>>(
//       procedure: P,
//       opts?: InjectTrpcOptions<R, P>,
//     ) => Promise<LightMyRequestResponse>;
//     injectTrpcBatchQuery: <R extends AnyRouter, P extends inferRouterProcedures<R>>(
//       procedure: P,
//       opts: InjectTrpcOptions<R, P>,
//     ) => Promise<LightMyRequestResponse>;
//     injectTrpcMutation: <R extends AnyRouter, P extends inferRouterProcedures<R>>(
//       procedure: P,
//       opts: InjectTrpcOptions<R, P>,
//     ) => Promise<LightMyRequestResponse>;
//   }
// }
