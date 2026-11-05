import { Effect, Console } from "effect"

// const task1 = Console.log("task1...")
// const task2 = Console.log("task2...")
const task1 = Effect.log("task1...")
const task2 = Effect.log("task2...")

const program = Effect.gen(function* () {
  // Perform some tasks
  yield* task1
  yield* task2
  // Introduce an error
  return yield* Effect.fail("Something went wrong!")
})

try {
  await Effect.runPromise(program)
} catch (e) {
  console.error(e)
  /*
  Output:
  task1...
  task2...
  */
  e // => "Something went wrong!"
}