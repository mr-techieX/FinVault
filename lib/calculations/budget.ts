import { db } from "@/lib/db";

export interface BudgetCategoryAnalysis {
  categoryName: string;
  budgeted: number;
  actual: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  color?: string;
}

export interface BudgetAnalysis {
  month: number;
  year: number;
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentUsed: number;
  categories: BudgetCategoryAnalysis[];
}

/**
 * Compare budget caps against actual expenses for a given month/year.
 */
export async function analyzeBudget(
  userId: string,
  month: number,
  year: number
): Promise<BudgetAnalysis | null> {
  const budget = await db.budget.findUnique({
    where: { userId_month_year: { userId, month, year } },
    include: { categories: true },
  });

  if (!budget) return null;

  // Fetch expenses for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const expenses = await db.expense.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
    include: { category: true },
  });

  // Aggregate expenses by category name
  const expenseByCategory: Record<string, number> = {};
  for (const expense of expenses) {
    const catName = expense.category?.name ?? "Uncategorized";
    expenseByCategory[catName] =
      (expenseByCategory[catName] ?? 0) + Number(expense.amount);
  }

  const categoryAnalysis: BudgetCategoryAnalysis[] = budget.categories.map(
    (cat) => {
      const actual = expenseByCategory[cat.categoryName] ?? 0;
      const budgeted = Number(cat.limit);
      const remaining = budgeted - actual;
      const percentUsed = budgeted > 0 ? (actual / budgeted) * 100 : 0;

      return {
        categoryName: cat.categoryName,
        budgeted,
        actual,
        remaining,
        percentUsed: Math.round(percentUsed * 10) / 10,
        isOverBudget: actual > budgeted,
        color: cat.color ?? undefined,
      };
    }
  );

  const totalBudgeted = categoryAnalysis.reduce(
    (sum, c) => sum + c.budgeted,
    0
  );
  const totalSpent = categoryAnalysis.reduce((sum, c) => sum + c.actual, 0);

  return {
    month,
    year,
    totalBudgeted,
    totalSpent,
    totalRemaining: totalBudgeted - totalSpent,
    overallPercentUsed:
      totalBudgeted > 0
        ? Math.round((totalSpent / totalBudgeted) * 1000) / 10
        : 0,
    categories: categoryAnalysis,
  };
}

/**
 * Calculate savings rate for a given month.
 * Savings Rate = (Total Income - Total Expenses) / Total Income × 100
 */
export async function calculateSavingsRate(
  userId: string,
  month: number,
  year: number
): Promise<{ income: number; expenses: number; savingsRate: number }> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const [incomes, expenses] = await Promise.all([
    db.income.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      select: { amount: true },
    }),
    db.expense.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      select: { amount: true },
    }),
  ]);

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const savingsRate =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 1000) / 10
      : 0;

  return { income: totalIncome, expenses: totalExpenses, savingsRate };
}
