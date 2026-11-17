const HUE_RANGE = 300;
const ORDERS_PER_CYCLE = 1200;

export function spectrumColor(order: number): string {
  const hue = Math.round(((order % ORDERS_PER_CYCLE) / ORDERS_PER_CYCLE) * HUE_RANGE);
  return `hsl(${hue}, 85%, 55%)`;
}
