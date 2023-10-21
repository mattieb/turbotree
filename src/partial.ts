export const partial =
  <TArg1, TRest extends any[], TReturn>(
    fn: (arg1: TArg1, ...rest: TRest) => TReturn,
    arg1: TArg1,
  ): ((...rest: TRest) => TReturn) =>
  (...rest) =>
    fn(arg1, ...rest);
