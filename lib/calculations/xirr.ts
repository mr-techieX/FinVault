export interface CashFlow {
  date: Date;
  amount: number; // Negative = outflow (buy), Positive = inflow (sell/current value)
}

/**
 * Calculate XIRR (Extended Internal Rate of Return) using Newton-Raphson method.
 * Used for SIP investments with irregular cash flows.
 *
 * @param cashFlows - Array of {date, amount} where negative = invested, positive = current value
 * @param guess - Initial guess for the rate (default 10%)
 * @returns Annual XIRR as a decimal (e.g., 0.15 = 15%)
 */
export function calculateXIRR(
  cashFlows: CashFlow[],
  guess = 0.1
): number | null {
  if (cashFlows.length < 2) return null;

  const MAX_ITERATIONS = 100;
  const TOLERANCE = 1e-7;

  const dates = cashFlows.map((cf) => cf.date);
  const amounts = cashFlows.map((cf) => cf.amount);
  const baseDate = dates[0];

  // Convert dates to year fractions from base date
  const yearFractions = dates.map(
    (d) =>
      (d.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  let rate = guess;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let f = 0; // NPV
    let df = 0; // NPV derivative

    for (let j = 0; j < amounts.length; j++) {
      const t = yearFractions[j];
      const factor = Math.pow(1 + rate, t);
      f += amounts[j] / factor;
      df -= (t * amounts[j]) / ((1 + rate) * factor);
    }

    const newRate = rate - f / df;

    if (Math.abs(newRate - rate) < TOLERANCE) {
      return newRate;
    }

    rate = newRate;

    // Guard against divergence
    if (rate <= -1) return null;
  }

  return null; // Did not converge
}

/**
 * Build XIRR cash flows from investment transactions + current value.
 */
export function buildXIRRCashFlows(
  transactions: { date: Date; amount: number; type: string }[],
  currentValue: number
): CashFlow[] {
  const cashFlows: CashFlow[] = transactions.map((t) => ({
    date: new Date(t.date),
    amount:
      t.type === "BUY" || t.type === "SIP"
        ? -Math.abs(t.amount) // outflow
        : Math.abs(t.amount), // inflow (sell/dividend)
  }));

  // Add current value as final inflow
  cashFlows.push({ date: new Date(), amount: currentValue });

  // Sort by date
  return cashFlows.sort((a, b) => a.date.getTime() - b.date.getTime());
}
