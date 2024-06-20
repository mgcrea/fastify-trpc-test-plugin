/* eslint-disable @typescript-eslint/no-explicit-any */

import type { FastifyPluginAsync, InjectOptions, LightMyRequestResponse } from "fastify";
import fastifyPlugin from "fastify-plugin";
import {
  exportHeaders,
  mergeHeaders,
  unwrapBatchTrpcResponse,
  unwrapTrpcResponse,
} from "src/utils";
import type { AppRouter, inferProcedureInput } from "./types";

export type FastifyTrpcTestPluginOptions = {
  defaultHeaders?: Record<string, string>;
  transformer?: any;
  prefix?: string;
};

type InjectTrpcOptions<T extends AppRouter["procedures"]> = Omit<
  InjectOptions,
  "method" | "url" | "body"
> & {
  input?: inferProcedureInput<T>;
};

const fastifyTrpcTestPlugin: FastifyPluginAsync<FastifyTrpcTestPluginOptions> = async (
  fastify,
  options,
): Promise<void> => {
  const { prefix = "", defaultHeaders = { accept: "application/json" }, transformer } = options;

  const injectTrpcQuery = async <T extends AppRouter["procedures"]>(
    procedure: T,
    opts: InjectTrpcOptions<T> = {},
  ): Promise<LightMyRequestResponse> => {
    const { input: json, headers: optionsHeaders, ...rest } = opts;

    const params = new URLSearchParams();
    if (json) {
      params.set("input", JSON.stringify({ json }));
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.json = <T = any>(): T => {
      return unwrapTrpcResponse(original<T>());
    };
    return res;
  };
  fastify.decorate("injectTrpcQuery", injectTrpcQuery);

  const injectTrpcBatchQuery = async <T extends AppRouter["procedures"]>(
    procedure: T,
    opts: InjectTrpcOptions<T>,
  ): Promise<LightMyRequestResponse> => {
    const { input: json, headers: optionsHeaders, ...rest } = opts;

    const params = new URLSearchParams([["batch", "1"]]);
    if (json) {
      params.set("input", JSON.stringify({ 0: { json } }));
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.json = <T = any>(): T => {
      return unwrapBatchTrpcResponse(original<T>());
    };
    return res;
  };
  fastify.decorate("injectTrpcBatchQuery", injectTrpcBatchQuery);

  const injectTrpcMutation = async <T extends AppRouter["procedures"]>(
    procedure: T,
    opts: InjectTrpcOptions<T>,
  ): Promise<LightMyRequestResponse> => {
    const { input: json, headers: optionsHeaders, ...rest } = opts;

    const params = new URLSearchParams([["batch", "1"]]);
    const headers = new Headers(Object.entries(defaultHeaders));
    headers.set("content-type", "application/json");
    const url = `${prefix}/${procedure}?${params.toString()}`;

    const res = await fastify.inject({
      ...rest,
      method: "POST",
      url,
      headers: exportHeaders(mergeHeaders(headers, optionsHeaders)),
      body: { 0: transformer ? transformer.serialize(json) : JSON.stringify(json) },
    });

    const { json: original } = res;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.json = <T = any>(): T => {
      return unwrapBatchTrpcResponse(original<T>());
    };
    return res;
  };
  fastify.decorate("injectTrpcMutation", injectTrpcMutation);
};

export const fastifyTrpcTest = fastifyPlugin(fastifyTrpcTestPlugin);

declare module "fastify" {
  interface FastifyInstance {
    injectTrpcQuery: <T extends AppRouter["procedures"]>(
      procedure: T,
      opts?: InjectTrpcOptions<T>,
    ) => Promise<LightMyRequestResponse>;
    injectTrpcBatchQuery: <T extends AppRouter["procedures"]>(
      procedure: T,
      opts: InjectTrpcOptions<T>,
    ) => Promise<LightMyRequestResponse>;
    injectTrpcMutation: <T extends AppRouter["procedures"]>(
      procedure: T,
      opts: InjectTrpcOptions<T>,
    ) => Promise<LightMyRequestResponse>;
  }
}
