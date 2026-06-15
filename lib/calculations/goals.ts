export interface GoalProgress {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progressPercent: number;
  remainingAmount: number;
  deadline: Date | null;
  monthsRemaining: number | null;
  requiredMonthlySavings: number | null;
  projectedCompletionDate: Date | null;
  isOnTrack: boolean;
  isCompleted: boolean;
  priority: string;
  icon?: string | null;
  color?: string | null;
}

/**
 * Calculate goal progress metrics.
 */
export function calculateGoalProgress(goal: {
  id: string;
  name: string;
  targetAmount: number | string;
  currentAmount: number | string;
  deadline: Date | null;
  isCompleted: boolean;
  priority: string;
  icon?: string | null;
  color?: string | null;
  contributions?: { amount: number | string; date: Date }[];
}): GoalProgress {
  const target = Number(goal.targetAmount);
  const current = Number(goal.currentAmount);
  const progressPercent = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const remaining = Math.max(0, target - current);

  let monthsRemaining: number | null = null;
  let requiredMonthlySavings: number | null = null;
  let projectedCompletionDate: Date | null = null;
  let isOnTrack = false;

  const now = new Date();

  if (goal.deadline) {
    const diffMs = goal.deadline.getTime() - now.getTime();
    monthsRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30.44)));
    requiredMonthlySavings =
      monthsRemaining > 0 ? remaining / monthsRemaining : remaining;
  }

  // Calculate average monthly contribution rate
  if (goal.contributions && goal.contributions.length > 0) {
    const sortedContribs = [...goal.contributions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstDate = new Date(sortedContribs[0].date);
    const monthsActive = Math.max(
      1,
      (now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    );
    const avgMonthly = current / monthsActive;

    if (avgMonthly > 0 && remaining > 0) {
      const monthsToComplete = remaining / avgMonthly;
      projectedCompletionDate = new Date(
        now.getTime() + monthsToComplete * 30.44 * 24 * 60 * 60 * 1000
      );
    }

    // On track if projected completion is before deadline (or no deadline)
    if (goal.deadline && projectedCompletionDate) {
      isOnTrack = projectedCompletionDate <= goal.deadline;
    } else if (!goal.deadline) {
      isOnTrack = avgMonthly > 0;
    }
  }

  return {
    id: goal.id,
    name: goal.name,
    targetAmount: target,
    currentAmount: current,
    progressPercent: Math.round(progressPercent * 10) / 10,
    remainingAmount: remaining,
    deadline: goal.deadline,
    monthsRemaining,
    requiredMonthlySavings:
      requiredMonthlySavings !== null
        ? Math.round(requiredMonthlySavings * 100) / 100
        : null,
    projectedCompletionDate,
    isOnTrack,
    isCompleted: goal.isCompleted || progressPercent >= 100,
    priority: goal.priority,
    icon: goal.icon,
    color: goal.color,
  };
}
