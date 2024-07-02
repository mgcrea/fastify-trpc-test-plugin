# Fastify TRPC Test Plugin

<!-- markdownlint-disable MD033 -->
<p align="center">
  <a href="https://www.npmjs.com/package/@mgcrea/fastify-trpc-test-plugin">
    <img src="https://img.shields.io/npm/v/@mgcrea/fastify-trpc-test-plugin.svg?style=for-the-badge" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/fastify-trpc-test-plugin">
    <img src="https://img.shields.io/npm/dt/@mgcrea/fastify-trpc-test-plugin.svg?style=for-the-badge" alt="npm total downloads" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/fastify-trpc-test-plugin">
    <img src="https://img.shields.io/npm/dm/@mgcrea/fastify-trpc-test-plugin.svg?style=for-the-badge" alt="npm monthly downloads" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/fastify-trpc-test-plugin">
    <img src="https://img.shields.io/npm/l/@mgcrea/fastify-trpc-test-plugin.svg?style=for-the-badge" alt="npm license" />
  </a>
  <br />
  <a href="https://github.com/mgcrea/fastify-trpc-test-plugin/actions/workflows/main.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/mgcrea/fastify-trpc-test-plugin/main.yml?style=for-the-badge&branch=master" alt="build status" />
  </a>
  <a href="https://depfu.com/github/mgcrea/fastify-trpc-test-plugin">
    <img src="https://img.shields.io/depfu/dependencies/github/mgcrea/fastify-trpc-test-plugin?style=for-the-badge" alt="dependencies status" />
  </a>
</p>
<!-- markdownlint-enable MD037 -->

## Features

Test plugin to easily test [trpc](https://github.com/trpc/trpc) endpoints for a [fastify](https://fastify.dev) server.

- Built with [TypeScript](https://www.typescriptlang.org/) for static type checking with exported types along the library.

## Install

```bash
npm install @mgcrea/fastify-trpc-test-plugin --save
# or
pnpm add @mgcrea/fastify-trpc-test-plugin
```

### Usage

- First you need to register the plugin and overload the `FastifyInstance` interface with your `AppRouter` type.

```ts
import {
  fastifyTrpcTest,
  type InjectTrpcOptions,
  type inferRouterProcedures,
} from "@mgcrea/fastify-trpc-test-plugin";
import createFastify, {
  FastifyListenOptions,
  type FastifyServerOptions,
  type LightMyRequestResponse,
} from "fastify";
import type { AppRouter } from "src/trpc";
import superJSON from "superjson";

export const createServer = async (options: FastifyServerOptions = {}) => {
  const app = createFastify(options);
  await app.register(fastifyTrpcTest, {
    prefix: "/trpc",
    defaultHeaders: { accept: "application/json", authorization: `Bearer ${1n}` },
    transformer: superJSON,
  });
  return;
};

declare module "fastify" {
  interface FastifyInstance {
    injectTrpcQuery: <R extends AppRouter, P extends inferRouterProcedures<R>>(
      procedure: P,
      opts?: InjectTrpcOptions<R, P>,
    ) => Promise<LightMyRequestResponse>;
    injectTrpcBatchQuery: <R extends AppRouter, P extends inferRouterProcedures<R>>(
      procedure: P,
      opts: InjectTrpcOptions<R, P>,
    ) => Promise<LightMyRequestResponse>;
    injectTrpcMutation: <R extends AppRouter, P extends inferRouterProcedures<R>>(
      procedure: P,
      opts: InjectTrpcOptions<R, P>,
    ) => Promise<LightMyRequestResponse>;
  }
}
```

- Then you can use the added helpers in your tests with working type safety / auto-completion.

```ts
test("push patch with replace operation", async () => {
  const res = await app.injectTrpcMutation("imageDetection.pushImageDetectionPatches", {
    input: {
      id: 1,
      patches: [
        {
          op: "replace",
          path: "/0/code/value",
          value: "466362",
        },
      ],
    },
  });
  expect(res.statusCode).toBe(200);
});
```

## Authors

- [Olivier Louvignes](https://github.com/mgcrea) <<olivier@mgcrea.io>>

## License

```txt
The MIT License

Copyright (c) 2024 Olivier Louvignes <olivier@mgcrea.io>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
