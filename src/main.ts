import { NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"

const greet = (name: string) =>
  Effect.gen(function* () {
    yield* Effect.log(`Greeting ${name} 🥲`)
    return `Hello, ${name}!`
  })

const program = Effect.gen(function* () {
  const message = yield* greet("Effect")
  yield* Effect.log(message)
})

/**
 * Running an Effect: `NodeRuntime.runMain` vs `Effect.runPromise`
 *
 * An Effect is only a description of work; nothing happens until a runner
 * executes it. Both of these run `program`, but behave differently at the edges:
 *
 * `NodeRuntime.runMain(program)`  (from @effect/platform-node)
 *   - Meant for the main entry point of a Node.js app/script.
 *   - Ctrl+C (SIGINT/SIGTERM) interrupts the program, so finalizers
 *     (`Effect.ensuring`, `acquireRelease`, ...) run before the process exits.
 *   - Failures are logged in a readable format, and the process exit code is
 *     set for you (0 on success, 1 on failure, 130 when stopped with Ctrl+C).
 *   - Node-only; does not exist in the browser or Cloudflare Workers.
 *   Docs: https://effect.website/docs/platform/runtime/
 *
 * `Effect.runPromise(program)`  (from effect)
 *   - Returns a Promise: resolves with the success value, rejects on failure.
 *   - No Ctrl+C handling: Node kills the process and finalizers do not run.
 *   - A failure becomes an unhandled promise rejection unless you `.catch()`
 *     it (or handle errors inside the Effect first).
 *   - Works anywhere (Node, browser, Workers); use it where non-Effect code
 *     needs a Promise, e.g. inside a Hono/Express route handler.
 *   Docs: https://effect.website/docs/getting-started/running-effects/
 */

NodeRuntime.runMain(program)

// Effect.runPromise(program)

// const msg = await Effect.runPromise(greet("This is out !!"))

// msg
