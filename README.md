<h1 align="center">Learn Effect TS</h1>

<div align="center">
  <img src="https://img.shields.io/badge/Effect-v4-c6a0f6.svg?style=for-the-badge" alt="Effect v4">
  <img src="https://img.shields.io/badge/TypeScript-7-8aadf4.svg?style=for-the-badge" alt="TypeScript 7">
  <img src="https://img.shields.io/badge/Node-24+-a6da95.svg?style=for-the-badge" alt="Node 24+">
  <img src="https://img.shields.io/badge/pnpm-11-eed49f.svg?style=for-the-badge" alt="pnpm 11">
</div>

> ## a playground for learning Effect

A small TypeScript project for learning [Effect](https://effect.website) (v4) on Node.js.
Write a lesson as a `.ts` file, run it straight away with tsx, and test it with Vitest.
There is no build step and no browser setup.

### [🌸 Everything All At Once (～￣▽￣)～](./EFFECT-GET-STARTER.md)

## 🚀 Features

- **Run any file directly**: `pnpm dev <file>` runs a TypeScript file and re-runs it on every save.
- **Effect v4 out of the box**: `effect` and `@effect/platform-node`, with a working starter program.
- **Effect-aware tests**: Vitest with `@effect/vitest`, so a test can be a plain `Effect`.
- **Strict TypeScript**: `strict` and `exactOptionalPropertyTypes` turned on, as Effect recommends.
- **Minimal**: no bundler, no framework, nothing to configure before you start writing code.

## 🌺 Tech Stack

| Layer   | Tools                                         |
| ------- | --------------------------------------------- |
| Core    | Effect v4 (`effect`)                          |       |
| Runner  | tsx (runs `.ts` files directly, watch mode)   |
| Testing | Vitest, `@effect/vitest`                      |
| Tooling | TypeScript 7 (`tsc` for type checking), pnpm  |

## ⚡ Run on your machine

**Requirements**

- Node >= 24
- [pnpm](https://pnpm.io/) >= 11

```bash
git clone https://github.com/SaketV8/-learn-effect-ts learn-effect-ts
cd learn-effect-ts
pnpm install

pnpm dev src/main.ts          # run and re-run on every save
pnpm start src/main.ts        # run once
```

Expected output from `src/main.ts`:

```
[12:00:00.000] INFO (#2): Greeting Effect 🥲
[12:00:00.001] INFO (#2): Hello, Effect!
```

### Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `pnpm dev <file>`   | Run a file and re-run it on every save   |
| `pnpm start <file>` | Run a file once                          |
| `pnpm test`         | Run tests in watch mode (`--run` once)   |
| `pnpm typecheck`    | Type-check the project with `tsc`        |

> tsx strips types without checking them, so run `pnpm typecheck` to see type errors.

## 📝 Writing a new lesson

Create a file such as `src/01-basics.ts`. Every runnable file follows the same pattern:
build a program as an `Effect`, then hand it to `NodeRuntime.runMain`.

```ts
import { NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  yield* Effect.log("Hello from a new lesson")
})

NodeRuntime.runMain(program)
```

```bash
pnpm dev src/01-basics.ts
```

`NodeRuntime.runMain` runs the program, logs any failure, sets the process exit code,
and cleans up on Ctrl+C.

## 🧪 Testing

Tests live in `test/`. `it.effect` from `@effect/vitest` runs an `Effect` as a test:

```ts
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

describe("greet", () => {
  it.effect("returns a greeting", () =>
    Effect.gen(function* () {
      const message = yield* Effect.succeed("Hello, Effect!")
      expect(message).toBe("Hello, Effect!")
    }))
})
```

```bash
pnpm test            # watch mode
pnpm test --run      # run once
```

## ⚙️ Notes

- **Effect version**: this project uses Effect **v4**. Many older tutorials and blog posts
  target v3, so some APIs may differ. When something doesn't match, check the
  [official docs](https://effect.website/docs).
- **`pnpm-workspace.yaml`**: pnpm 11 only runs a dependency's install scripts when you
  allow them. `esbuild` (used by tsx and Vitest) is allowed under `allowBuilds`. The
  `minimumReleaseAgeExclude` list lets recent Effect releases install even though they
  are newer than pnpm's minimum release age.

## 📂 Folder Structure

```
.
├── src
│   ├── main.ts                 # starter Effect program, run via NodeRuntime.runMain
│   └── 01-hono-github-profile.ts   # lesson: Hono API that fetches + reshapes a GitHub profile
├── test
│   └── greet.test.ts           # example test using it.effect
├── package.json                # scripts + dependencies
├── pnpm-workspace.yaml         # pnpm settings (allowBuilds, release-age excludes)
├── tsconfig.json               # strict TypeScript config for Node
└── README.md
```
