export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const HOLD_MINUTES = 20;
export const OFFER_HOURS = 24;
export const MAX_RENTAL_WEEKS = 26;

export function normalizeDate(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  return date.toISOString().slice(0, 10);
}

export function addWeeks(startDate: string, weeks: number): string {
  if (!Number.isInteger(weeks) || weeks < 1 || weeks > MAX_RENTAL_WEEKS) {
    throw new Error(`Rental period must be between 1 and ${MAX_RENTAL_WEEKS} weeks`);
  }
  const date = new Date(`${normalizeDate(startDate)}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + weeks * 7);
  return date.toISOString().slice(0, 10);
}

/** Half-open overlap: [start, end) — adjacent weeks do not overlap. */
export function periodsOverlap(
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
): boolean {
  return firstStart < secondEnd && secondStart < firstEnd;
}

export function futureWeeklyStartDates(count = 10, now = new Date()): string[] {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const daysUntilMonday = (8 - start.getUTCDay()) % 7;
  start.setUTCDate(start.getUTCDate() + daysUntilMonday);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index * 7);
    return date.toISOString().slice(0, 10);
  });
}

export function futureDailyStartDates(count = 90, now = new Date()): string[] {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

export function makeToken(): string {
  return crypto.randomUUID().replaceAll("-", "");
}

export function isoAfterMinutes(minutes: number, now = new Date()): string {
  return new Date(now.getTime() + minutes * 60_000).toISOString();
}

export function isoAfterHours(hours: number, now = new Date()): string {
  return new Date(now.getTime() + hours * 60 * 60_000).toISOString();
}

/** Total rental charge in cents for weekly_price_cents × weeks. */
export function calculateWeeklyTotal(weeklyPriceCents: number, weeks: number): number {
  if (!Number.isInteger(weeklyPriceCents) || weeklyPriceCents < 0) {
    throw new Error("weeklyPriceCents must be a non-negative integer");
  }
  if (!Number.isInteger(weeks) || weeks < 1 || weeks > MAX_RENTAL_WEEKS) {
    throw new Error(`weeks must be an integer between 1 and ${MAX_RENTAL_WEEKS}`);
  }
  return weeklyPriceCents * weeks;
}

/** Build exact 7-day rental period boundaries for a multi-week reservation. */
export function buildRentalPeriods(
  startDate: string,
  weeks: number,
): Array<{ weekIndex: number; startDate: string; endDate: string }> {
  const start = normalizeDate(startDate);
  if (!Number.isInteger(weeks) || weeks < 1 || weeks > MAX_RENTAL_WEEKS) {
    throw new Error(`weeks must be an integer between 1 and ${MAX_RENTAL_WEEKS}`);
  }
  return Array.from({ length: weeks }, (_, index) => {
    const periodStart = index === 0 ? start : addWeeks(start, index);
    const periodEnd = addWeeks(start, index + 1);
    return {
      weekIndex: index + 1,
      startDate: periodStart,
      endDate: periodEnd,
    };
  });
}

export function holdExpiresAt(now = new Date(), minutes = HOLD_MINUTES): string {
  return isoAfterMinutes(minutes, now);
}

export function matchesWaitingClient(
  vehicle: {
    category: string;
    weekly_price: number;
    location: string;
    eligibility: string;
  },
  client: {
    preferred_vehicle_type: string;
    weekly_budget: number;
    location: string;
    approved_platforms: string;
  },
): boolean {
  const categoryMatch =
    client.preferred_vehicle_type === "Any" ||
    vehicle.category.toLowerCase() === client.preferred_vehicle_type.toLowerCase();
  const budgetMatch = client.weekly_budget >= vehicle.weekly_price;
  const locationMatch =
    !client.location ||
    vehicle.location.toLowerCase().includes(client.location.toLowerCase()) ||
    client.location.toLowerCase().includes(vehicle.location.toLowerCase());
  const vehiclePlatforms = vehicle.eligibility.toLowerCase();
  const platformMatch = client.approved_platforms
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .some((platform) => vehiclePlatforms.includes(platform));
  return categoryMatch && budgetMatch && locationMatch && platformMatch;
}
