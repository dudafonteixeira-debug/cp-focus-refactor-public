const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

function partsFor(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function toLocalDateKey(
  value: Date | number | string = new Date(),
  timeZone = DEFAULT_TIME_ZONE,
): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Data invalida.");
  }

  return partsFor(date, timeZone);
}

export function todayKey(timeZone = DEFAULT_TIME_ZONE): string {
  return toLocalDateKey(new Date(), timeZone);
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12));
  return date.toISOString().slice(0, 10);
}
