export interface AmortizationRow {
  month: number;
  date: string;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
  totalPaid: number;
  totalInterestPaid: number;
}

export interface AmortizationSchedule {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  schedule: AmortizationRow[];
}

export interface PrepaymentSimulation {
  originalInterest: number;
  newInterest: number;
  interestSaved: number;
  originalTenure: number;
  newTenure: number;
  monthsSaved: number;
}

/**
 * Calculate EMI using reducing balance formula:
 * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 */
export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 100 / 12; // monthly rate
  const n = tenureMonths;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Generate full amortization schedule for a loan.
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  startDate: Date
): AmortizationSchedule {
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const monthlyRate = annualRate / 100 / 12;
  const schedule: AmortizationRow[] = [];

  let balance = principal;
  let totalPaid = 0;
  let totalInterestPaid = 0;

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(emi - interest, balance);
    const actualEmi = interest + principalPaid;
    balance = Math.max(0, balance - principalPaid);
    totalPaid += actualEmi;
    totalInterestPaid += interest;

    const date = new Date(startDate);
    date.setMonth(date.getMonth() + month - 1);

    schedule.push({
      month,
      date: date.toISOString().split("T")[0],
      emi: Math.round(actualEmi * 100) / 100,
      principal: Math.round(principalPaid * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
    });

    if (balance <= 0) break;
  }

  return {
    emi: Math.round(emi * 100) / 100,
    totalAmount: Math.round(totalPaid * 100) / 100,
    totalInterest: Math.round(totalInterestPaid * 100) / 100,
    schedule,
  };
}

/**
 * Simulate a prepayment and calculate interest savings and tenure reduction.
 */
export function simulatePrepayment(
  currentBalance: number,
  annualRate: number,
  remainingMonths: number,
  prepaymentAmount: number,
  startDate: Date
): PrepaymentSimulation {
  const original = generateAmortizationSchedule(
    currentBalance,
    annualRate,
    remainingMonths,
    startDate
  );

  const newBalance = Math.max(0, currentBalance - prepaymentAmount);
  const simulated = generateAmortizationSchedule(
    newBalance,
    annualRate,
    remainingMonths,
    startDate
  );

  return {
    originalInterest: original.totalInterest,
    newInterest: simulated.totalInterest,
    interestSaved: original.totalInterest - simulated.totalInterest,
    originalTenure: original.schedule.length,
    newTenure: simulated.schedule.length,
    monthsSaved: original.schedule.length - simulated.schedule.length,
  };
}
