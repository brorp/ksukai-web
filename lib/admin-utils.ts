export const asString = (value: unknown, fallback = "-"): string =>
  typeof value === "string" && value.length > 0 ? value : fallback;

export const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" ? value : Number(value ?? fallback);
