const TIMEFRAME_SECONDS = {
  "5m": 5 * 60,
  "15m": 15 * 60,
};

function toUnixSeconds(value) {
  if (value instanceof Date) {
    return Math.floor(value.getTime() / 1000);
  }

  if (typeof value === "number") {
    return value > 1e12 ? Math.floor(value / 1000) : Math.floor(value);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }

  return Math.floor(parsed.getTime() / 1000);
}

export function makeCryptoUpDownSlug({
  asset = "btc",
  timeframe = "5m",
  at = Date.now(),
} = {}) {
  const windowSeconds = TIMEFRAME_SECONDS[timeframe];

  if (!windowSeconds) {
    throw new Error(`Unsupported timeframe: ${timeframe}`);
  }

  const unixSeconds = toUnixSeconds(at);
  const windowStart = Math.floor(unixSeconds / windowSeconds) * windowSeconds;

  return `${asset.toLowerCase()}-updown-${timeframe}-${windowStart}`;
}