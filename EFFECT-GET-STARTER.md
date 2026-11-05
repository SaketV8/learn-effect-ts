<h1 align="center">Effect Starter</h1>

> ## how `Effect.gen`, `yield*`, `Effect.log` and `Effect.runPromise` fit together

This guide is for someone seeing Effect for the first time. Every example below was run in
this project; the outputs are real (only the timestamps are replaced with `12:00:00.000`).

You can run any example yourself: paste it into a file such as `src/playground.ts` and run
`pnpm dev src/playground.ts`.

## 🧠 The big idea: first describe, then run

An **Effect is a description of work**, like a recipe. Writing the recipe doesn't cook
anything. Something has to **run** it.

```
      1. DESCRIBE (nothing happens)              2. RUN (now it happens)
 ┌──────────────────────────────────┐      ┌──────────────────────────────────┐
 │  Effect.log("Hi")                │      │  Effect.runPromise(effect)       │
 │  Effect.succeed(42)              │ ───► │  NodeRuntime.runMain(effect)     │
 │  Effect.gen(function* () { … })  │      │                                  │
 └──────────────────────────────────┘      └──────────────────────────────────┘
           the recipe                                  the cook
     (a plain value you can store,              (actually prints, fetches,
      pass around, and reuse)                    computes; gives the result)
```

Everything else follows from this: you build Effects, combine them into bigger Effects,
and run the final one **once**, at the edge of your program.

## 🧩 The four pieces

| Piece | What it is | Where you use it |
| --- | --- | --- |
| `Effect.log("…")`, `Effect.succeed(x)` | Small ready-made Effects (building blocks) | Anywhere |
| `Effect.gen(function* () { … })` | Combines several Effects into one, step by step | To build a bigger Effect |
| `yield*` | "Run this step and give me its result" | **Only inside** `Effect.gen` |
| `Effect.runPromise(effect)` | Runs an Effect and returns a `Promise` of its result | At the edge, outside Effect code |

## 🔁 If you already know `async` / `await`

Effect's generator style maps almost one-to-one onto `async`/`await`:

| async / await | Effect |
| --- | --- |
| `async function () { … }` | `Effect.gen(function* () { … })` |
| `await somePromise` | `yield* someEffect` |
| `Promise<A>` | `Effect<A, E>` (also tracks the error type `E`) |
| calling `fn()` | `Effect.runPromise(effect)` |

```ts
// async / await                              // Effect
async function getTotal() {                   const getTotal = Effect.gen(function* () {
  const a = await Promise.resolve(2)            const a = yield* Effect.succeed(2)
  const b = await Promise.resolve(3)            const b = yield* Effect.succeed(3)
  return a + b                                  return a + b
}                                             })

const total = await getTotal()                const total = await Effect.runPromise(getTotal)
```

**One big difference:** calling an `async` function starts it immediately. An Effect does
nothing until you run it, and you can run the same Effect as many times as you like
(see [example 7](#7-the-same-effect-can-run-many-times)).

## 🗺️ How it flows: `src/main.ts` step by step

```ts
const greet = (name: string) =>
  Effect.gen(function* () {
    yield* Effect.log(`Greeting ${name} 🥲`)
    return `Hello, ${name}!`
  })

const program = Effect.gen(function* () {
  const message = yield* greet("Effect")
  yield* Effect.log(message)
})

Effect.runPromise(program)
```

```
 Effect.runPromise(program)                  ← the only line that makes anything happen
   │
   ▼
 program ─────────────────────────────────────────────────────────────────────┐
 │                                                                            │
 │  ① const message = yield* greet("Effect")                                  │
 │        │                     ▲                                             │
 │        │ runs greet          │ greet's return value                        │
 │        ▼                     │ "Hello, Effect!"                            │
 │     greet("Effect") ─────────┼──────────────────────────────────────┐      │
 │     │  yield* Effect.log(…)  │  → prints  INFO: Greeting Effect 🥲  │      │
 │     │  return "Hello, Effect!"                                      │      │
 │     └───────────────────────────────────────────────────────────────┘      │
 │                                                                            │
 │  ② yield* Effect.log(message)  → prints  INFO: Hello, Effect!              │
 │                                                                            │
 └────────────────────────────────────────────────────────────────────────────┘
   │
   ▼
 Promise resolves (with undefined, because program has no `return`)
```

Output:

```
[12:00:00.000] INFO (#1): Greeting Effect 🥲
[12:00:00.000] INFO (#1): Hello, Effect!
```

Notice: `greet` only **logs** the first line and **returns** the second. `program` is the
one that logs `Hello, Effect!`.

## 🧪 Examples

### 1. Building an Effect does nothing

```ts
const hello = Effect.log("Hello")

console.log("hello is:", typeof hello, Effect.isEffect(hello))
```

```
hello is: object true
```

`"Hello"` is **not** printed. `hello` is just an object describing "log Hello".

### 2. Run `Effect.log` directly with `runPromise` (no `Effect.gen` needed)

```ts
await Effect.runPromise(Effect.log("Hi from runPromise"))
```

```
[12:00:00.000] INFO (#1): Hi from runPromise
```

`Effect.log(…)` is already an Effect, so you can hand it straight to `runPromise`.
You only need `Effect.gen` + `yield*` when you want to **combine several steps**.

### 3. Get a value back

```ts
const n = await Effect.runPromise(Effect.succeed(42))
console.log("n =", n)
```

```
n = 42
```

`runPromise` returns a `Promise`, so `await` gives you the Effect's result.

### 4. `Effect.log` returns nothing

```ts
const r = await Effect.runPromise(Effect.log("x"))
console.log("log returns:", r)
```

```
[12:00:00.000] INFO (#1): x
log returns: undefined
```

Some Effects are run for their **result** (`Effect.succeed(42)` → `42`), others for their
**side effect** (`Effect.log` prints, then gives `undefined`).

### 5. Combine steps with `Effect.gen` + `yield*`

```ts
const program = Effect.gen(function* () {
  yield* Effect.log("step 1")
  const a = yield* Effect.succeed(2)
  const b = yield* Effect.succeed(3)
  yield* Effect.log(`a + b = ${a + b}`)
  return a + b
})

const total = await Effect.runPromise(program)
console.log("total =", total)
```

```
[12:00:00.000] INFO (#1): step 1
[12:00:00.000] INFO (#1): a + b = 5
total = 5
```

```
 yield* Effect.log("step 1")      → prints, result: undefined
 yield* Effect.succeed(2)         → a = 2
 yield* Effect.succeed(3)         → b = 3
 yield* Effect.log("a + b = 5")   → prints
 return 5                         → becomes the result of the whole program
                                         │
 await Effect.runPromise(program) ◄──────┘  total = 5
```

### 6. Write `Effect.gen` inline inside `runPromise`

```ts
await Effect.runPromise(
  Effect.gen(function* () {
    yield* Effect.log("inline gen")
  }),
)
```

```
[12:00:00.000] INFO (#1): inline gen
```

Same thing as examples 5 and `main.ts`, just without giving the Effect a name first.

### 7. The same Effect can run many times

```ts
const once = Effect.log("run me")

await Effect.runPromise(once)
await Effect.runPromise(once)
```

```
[12:00:00.000] INFO (#1): run me
[12:00:00.000] INFO (#2): run me
```

Because an Effect is only a description, running it twice does the work twice.
A `Promise`, by contrast, runs once and only remembers its result.

### 8. Running without `await`

```ts
Effect.runPromise(Effect.log("A (not awaited)"))
console.log("B (plain console.log)")
```

```
[12:00:00.000] INFO (#1): A (not awaited)
B (plain console.log)
```

`runPromise` **starts** the Effect straight away; `await` only **waits** for it to finish.
Without `await` you don't get the result back, and you can't be sure it finished before
the next line (here it did, because logging needs no waiting).

### 9. When something fails

```ts
try {
  await Effect.runPromise(Effect.fail("boom"))
} catch (e) {
  console.log("caught:", e)
}
```

```
caught: boom
```

`Effect.fail` describes a failure. When it runs, the `Promise` from `runPromise`
**rejects** with that error. Without `try/catch`, Node crashes with an
"unhandled promise rejection".

## 🔢 What do `#1`, `#2` mean?

They are **fiber IDs**. A fiber is Effect's lightweight "thread". Every
`Effect.runPromise(…)` call starts a new fiber, so:

```ts
Effect.runPromise(program)          // all its logs show #1
Effect.runPromise(greet("again"))   // all its logs show #2
```

When you see two different numbers, you are looking at two separate runs.

## ⚠️ Common mistakes

**1. `yield*` outside `Effect.gen`**

```ts
yield* Effect.log("top level")   // ✗
```

```
ERROR: "yield" is a reserved word and cannot be used in strict mode
```

`yield*` only works inside `function* () { … }`. At the top level of a file, run the Effect
instead: `Effect.runPromise(Effect.log("top level"))`.

**2. Forgetting `yield*` inside `Effect.gen`**

```ts
await Effect.runPromise(
  Effect.gen(function* () {
    Effect.log("you will NOT see this")   // ✗ only creates a description, then throws it away
    yield* Effect.log("you will see this")
  }),
)
```

```
[12:00:00.000] INFO (#1): you will see this
```

No error, no output: the first line silently does nothing. Inside `Effect.gen`,
**every Effect you want to happen needs `yield*`**.

**3. Never running the Effect**

```ts
const program = Effect.gen(function* () {
  yield* Effect.log("hello")
})
// ✗ no runPromise / runMain → prints nothing
```

**4. Calling an Effect like a function**

```ts
program()                    // ✗ TypeScript error: program is a value, not a function
Effect.runPromise(program)   // ✓
```

Note the difference with `greet`: `greet` **is** a function (it takes a `name`) that
**returns** an Effect, so `greet("Effect")` is correct, and it still needs to be run or
`yield*`-ed.

## 🚦 `runPromise` or `runMain`?

Both run an Effect. Short version (details in the comment in `src/main.ts`):

| | `Effect.runPromise` | `NodeRuntime.runMain` |
| --- | --- | --- |
| Returns | `Promise<A>` (you can `await` the result) | `void` |
| Ctrl+C | Process is killed, cleanup skipped | Program interrupted, cleanup runs |
| On failure | Promise rejects | Error logged, exit code 1 |
| Use for | Experiments, route handlers, non-Effect code | The main entry point of a Node script |

## 📚 Read next

1. [The Effect Type](https://effect.website/docs/getting-started/the-effect-type/): what `Effect<A, E, R>` means
2. [Creating Effects](https://effect.website/docs/getting-started/creating-effects/): `succeed`, `fail`, `sync`, `tryPromise`
3. [Running Effects](https://effect.website/docs/getting-started/running-effects/): `runPromise`, `runSync`, `runFork`
4. [Using Generators](https://effect.website/docs/getting-started/using-generators/): `Effect.gen` and `yield*` in depth
5. [Building Pipelines](https://effect.website/docs/getting-started/building-pipelines/): the `.pipe(...)` style used in the Hono lesson

> This project uses Effect v4. If an example in the docs uses an API name that doesn't
> match, check the type hints in your editor or the package's `.d.ts` files.
