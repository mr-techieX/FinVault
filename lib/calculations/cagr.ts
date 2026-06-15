/**
 * Calculate CAGR (Compound Annual Growth Rate)
 * Formula: CAGR = (Current Value / Initial Value)^(1/years) - 1
 */
export function calculateCAGR(
  initialValue: number,
  currentValue: number,
  years: number
): number {
  if (initialValue <= 0 || years <= 0) return 0;
  return Math.pow(currentValue / initialValue, 1 / years) - 1;
}

/**
 * Calculate absolute return percentage
 */
export function calculateAbsoluteReturn(
  invested: number,
  current: number
): number {
  if (invested <= 0) return 0;
  return ((current - invested) / invested) * 100;
}

/**
 * Calculate years between two dates
 */
export function yearsBetween(startDate: Date, endDate: Date = new Date()): number {
  const ms = endDate.getTime() - startDate.getTime();
  return ms / (1000 * 60 * 60 * 24 * 365.25);
}

/**
 * Project future value with a given growth rate
 * FV = PV × (1 + r)^n
 */
export function projectFutureValue(
  presentValue: number,
  annualRate: number,
  years: number
): number {
  return presentValue * Math.pow(1 + annualRate, years);
}
