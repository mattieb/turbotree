export const isDefined = <T>(value: T | undefined): value is T =>
  typeof value !== "undefined";

export const isUndefined = (value: any): value is undefined =>
  typeof value === "undefined";

export const defined = <T>(value: T | undefined) => {
  if (isUndefined(value)) throw new Error("undefined");
  return value;
};
