import { db } from "@/lib/db";

export interface NetWorthBreakdown {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  bankBalance: number;
  investmentsValue: number;
  assetsValue: number;
  loansOutstanding: number;
  creditCardDebt: number;
}

/**
 * Recalculate net worth for a user and save a snapshot.
 * Called automatically on every financial data write.
 */
export async function calculateAndSaveNetWorth(
  userId: string
): Promise<NetWorthBreakdown> {
  // Fetch all financial data in parallel
  const [bankAccounts, investments, assets, loans, creditCards] =
    await Promise.all([
      db.bankAccount.findMany({ where: { userId, isActive: true } }),
      db.investment.findMany({ where: { userId, isActive: true } }),
      db.asset.findMany({ where: { userId, isActive: true } }),
      db.loan.findMany({ where: { userId, isActive: true } }),
      db.creditCard.findMany({ where: { userId, isActive: true } }),
    ]);

  const bankBalance = bankAccounts.reduce(
    (sum, a) => sum + Number(a.balance),
    0
  );
  const investmentsValue = investments.reduce(
    (sum, i) => sum + Number(i.currentValue),
    0
  );
  const assetsValue = assets.reduce(
    (sum, a) => sum + Number(a.currentValue),
    0
  );
  const loansOutstanding = loans.reduce(
    (sum, l) => sum + Number(l.outstandingAmount),
    0
  );
  const creditCardDebt = creditCards.reduce(
    (sum, c) => sum + Number(c.outstanding),
    0
  );

  const totalAssets = bankBalance + investmentsValue + assetsValue;
  const totalLiabilities = loansOutstanding + creditCardDebt;
  const netWorth = totalAssets - totalLiabilities;

  // Save snapshot
  await db.netWorthSnapshot.create({
    data: {
      userId,
      totalAssets,
      totalLiabilities,
      netWorth,
      bankBalance,
      investmentsValue,
      assetsValue,
      loansOutstanding,
      creditCardDebt,
    },
  });

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    bankBalance,
    investmentsValue,
    assetsValue,
    loansOutstanding,
    creditCardDebt,
  };
}

/**
 * Get the latest net worth snapshot without saving a new one.
 */
export async function getLatestNetWorth(
  userId: string
): Promise<NetWorthBreakdown | null> {
  const snapshot = await db.netWorthSnapshot.findFirst({
    where: { userId },
    orderBy: { snapshotDate: "desc" },
  });

  if (!snapshot) return null;

  return {
    totalAssets: Number(snapshot.totalAssets),
    totalLiabilities: Number(snapshot.totalLiabilities),
    netWorth: Number(snapshot.netWorth),
    bankBalance: Number(snapshot.bankBalance),
    investmentsValue: Number(snapshot.investmentsValue),
    assetsValue: Number(snapshot.assetsValue),
    loansOutstanding: Number(snapshot.loansOutstanding),
    creditCardDebt: Number(snapshot.creditCardDebt),
  };
}

/**
 * Get net worth history for the last N months.
 */
export async function getNetWorthHistory(userId: string, months = 12) {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const snapshots = await db.netWorthSnapshot.findMany({
    where: { userId, snapshotDate: { gte: since } },
    orderBy: { snapshotDate: "asc" },
    select: {
      snapshotDate: true,
      netWorth: true,
      totalAssets: true,
      totalLiabilities: true,
    },
  });

  return snapshots.map((s) => ({
    date: s.snapshotDate.toISOString().split("T")[0],
    netWorth: Number(s.netWorth),
    totalAssets: Number(s.totalAssets),
    totalLiabilities: Number(s.totalLiabilities),
  }));
}
