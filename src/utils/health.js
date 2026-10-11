
const toNumber = (value) => {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
};

const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, value));

export function calculateFinancialHealth({
  budget = 10000,
  income = 10000,
  expenses = 2800,
  balance,
  savings = 1200,
  savingsGoal = 3000,
  currentDay = 10,
  subscriptions = [],
  transactions = [],
} = {}) {
  const totalIncome = toNumber(income);
  const totalExpenses = toNumber(expenses);
  const monthlyBudget = Math.max(1, toNumber(budget));

  const currentBalance =
    balance === undefined
      ? totalIncome - totalExpenses
      : toNumber(balance);

  const day = clamp(toNumber(currentDay), 1, 30);
  const daysLeft = Math.max(0, 30 - day);

  const reservedSavings = Math.max(0, toNumber(savings));
  const targetSavings = Math.max(1, toNumber(savingsGoal));

  const availableBalance = currentBalance - reservedSavings;

  // Active subscriptions
  const activeSubscriptions = (
    Array.isArray(subscriptions) ? subscriptions : []
  ).filter(
    (subscription) =>
      subscription.status !== "paused" &&
      subscription.is_active !== false &&
      subscription.active !== false
  );

  // Monthly subscription commitments
  const monthlySubscriptions = activeSubscriptions.reduce(
    (total, subscription) => {
      const amount = toNumber(
        subscription.amount ?? subscription.price
      );

      const cycle = String(
        subscription.billingCycle ??
        subscription.billing_cycle ??
        subscription.cycle ??
        "monthly"
      ).toLowerCase();

      if (cycle === "yearly" || cycle === "annual") {
        return total + amount / 12;
      }

      if (cycle === "weekly") {
        return total + amount * (30 / 7);
      }

      return total + amount;
    },
    0
  );

  // Spending calculations
  const dailySpending = totalExpenses / day;

  const projectedRemainingSpending =
    dailySpending * daysLeft;

  const projectedSubscriptionReserve =
    monthlySubscriptions * (daysLeft / 30);

  const projectedBalance =
    availableBalance -
    projectedRemainingSpending -
    projectedSubscriptionReserve;

  const dailyAllowance =
    daysLeft > 0
      ? Math.max(
          0,
          (
            availableBalance -
            projectedSubscriptionReserve
          ) / daysLeft
        )
      : 0;

  // Score calculations
  const spendingRatio = totalExpenses / monthlyBudget;

  const savingsRatio = clamp(
    reservedSavings / targetSavings,
    0,
    1
  );

  const survivalDays =
    dailySpending > 0
      ? Math.max(
          0,
          availableBalance / dailySpending
        )
      : daysLeft;

  const budgetScore = clamp(
    100 - spendingRatio * 55,
    0,
    100
  );

  const savingsScore = savingsRatio * 100;

  const forecastScore =
    projectedBalance >= 0
      ? 100
      : clamp(
          100 +
            (projectedBalance / monthlyBudget) * 100,
          0,
          100
        );

  const subscriptionRatio =
    monthlySubscriptions / monthlyBudget;

  const commitmentScore = clamp(
    100 - subscriptionRatio * 150,
    0,
    100
  );

  const healthScore = Math.round(
    budgetScore * 0.25 +
    savingsScore * 0.2 +
    forecastScore * 0.4 +
    commitmentScore * 0.15
  );

  // Financial risk
  let risk = "Low";

  if (
    projectedBalance < 0 ||
    availableBalance < 0 ||
    healthScore < 45
  ) {
    risk = "High";
  } else if (
    healthScore < 75 ||
    projectedBalance < monthlyBudget * 0.1
  ) {
    risk = "Moderate";
  }

  // Smart insights
  const insights = [];

  if (projectedBalance < 0) {
    insights.push({
      type: "warning",
      title: "Overspending Alert",
      message:
        "At your current spending pace, your funds may run out before the month ends.",
    });
  } else {
    insights.push({
      type: "success",
      title: "Positive Month-End Forecast",
      message:
        "Your current spending pattern is projected to stay within your available funds.",
    });
  }

  if (dailySpending > dailyAllowance && daysLeft > 0) {
    insights.push({
      type: "warning",
      title: "Reduce Daily Spending",
      message:
        `You are spending about ₹${Math.round(dailySpending)} per day. ` +
        `Your remaining daily allowance is ₹${Math.round(dailyAllowance)}.`,
    });
  }

  if (savingsRatio < 0.5) {
    insights.push({
      type: "info",
      title: "Grow Your Emergency Fund",
      message:
        "You are below 50% of your savings target. Consider setting aside a small amount regularly.",
    });
  } else {
    insights.push({
      type: "success",
      title: "Savings Progress",
      message:
        "Your savings allocation is making good progress toward your target.",
    });
  }

  if (subscriptionRatio > 0.15) {
    insights.push({
      type: "warning",
      title: "Subscription Spending",
      message:
        "Your monthly subscription commitments exceed 15% of your budget.",
    });
  }

  if (survivalDays < daysLeft && dailySpending > 0) {
    insights.push({
      type: "warning",
      title: "Budget Survival Risk",
      message:
        "At your current average spending rate, your available funds may not last for all remaining days.",
    });
  }

  return {
    healthScore,
    score: healthScore,
    risk,
    riskLevel: risk,

    budget: monthlyBudget,
    income: totalIncome,
    expenses: totalExpenses,
    balance: currentBalance,
    availableBalance,

    savings: reservedSavings,
    savingsGoal: targetSavings,
    savingsProgress: Math.round(savingsRatio * 100),

    currentDay: day,
    daysLeft,
    dailySpending,
    dailyAllowance,

    projectedBalance,
    forecast: projectedBalance,

    monthlySubscriptions,
    subscriptionTotal: monthlySubscriptions,

    survivalDays: Math.round(survivalDays),
    insights,
    transactions,
  };
}

// Compatible named exports
export const financialHealth = calculateFinancialHealth;
export const getFinancialHealth = calculateFinancialHealth;
export const calculateHealthScore = calculateFinancialHealth;

// Default export
export default calculateFinancialHealth;
export const money = (amount) =>
  "₹" + Math.round(Number(amount) || 0).toLocaleString("en-IN");