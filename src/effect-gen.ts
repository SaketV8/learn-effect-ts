import { Effect } from "effect";

// func to apply fix service charge
const addServiceCharge = (amount: number) => amount + 1;

// v2
const addServiceCharge2 = (amount: number): Effect.Effect<number> => {
  return Effect.succeed(amount + 2);
};

// func to apply discount safely
const applyDiscount = (
  total: number,
  discountRate: number,
): Effect.Effect<number, Error> => {
  return discountRate === 0
    ? Effect.fail(new Error("Discount Rate cannot be zero!"))
    : Effect.succeed(total - (total * discountRate) / 100);
};

// simulated task to get the amount from database
const fetchTransactionAmount = Effect.promise(() => Promise.resolve(180));

// simulated task to get the discount rate from database
const fetchDiscountRate = Effect.promise(() => Promise.resolve(10));

const billing = Effect.gen(function* () {
  // get the transaction amount
  const transactionAmount = yield* fetchTransactionAmount;

  // get the discount rate
  const discountRate = yield* fetchDiscountRate;

  // calc discounted amount
  const discountedAmount = yield* applyDiscount(
    transactionAmount,
    discountRate,
  );

  // apply service charge
  // avoid using yield for normal sync fucntion
  // use yield to get the value of Effect
  //   const finalAmount = yield addServiceCharge(discountedAmount);

  // const finalAmount = addServiceCharge(discountedAmount);

  const finalAmount = yield* addServiceCharge2(discountedAmount);

  return `final amount: ₹${finalAmount}`;
});

const result = await Effect.runPromise(billing);
console.log(result);
