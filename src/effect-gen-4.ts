import { Effect } from "effect"

class MyClass {
  readonly local = 1
  compute = Effect.gen({ self: this }, function* () {
    const n = this.local + 1

    yield* Effect.log(`Computed value: ${n}`)

    return n
  })
}

// const result = await Effect.runPromise(new MyClass().compute) // => 2
// console.log(result)

/*
Output:
timestamp=... level=INFO fiber=#0 message="Computed value: 2"
*/


Effect.runPromise(new MyClass().compute).then(console.log, console.error) // => 2