import { Effect } from "effect";

const task1 = Effect.log("task1...");
const task2 = Effect.log("task2...");

const failure1 = Effect.fail("Something went wrong!")

const task3 = Effect.log("task2...");

const program = Effect.gen(function* () {
  yield* task1;
  yield* task2;
  
  yield* failure1;
  
  yield* task3;

  return "final result";
});

Effect.runPromise(program).then(console.log, console.error)
