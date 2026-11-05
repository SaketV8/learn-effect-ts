import { pipe } from "effect"

// Define simple arithmetic operations
const increment = (x: number) => x + 1
const double = (x: number) => x * 2
const subtractTen = (x: number) => x - 10


const result = pipe(5, increment, double, subtractTen)

console.log(result)

result