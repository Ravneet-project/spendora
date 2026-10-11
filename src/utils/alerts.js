
const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatMoney = (amount) =>
  "₹" + Math.round(num(amount)).toLocaleString("en-IN");

export function getBudgetAlerts(finance = {}) {
  const {
    budget = 10000,
    expenses = 0,
    balance = 0,
    savings = 0,
    currentDay = 1,
    subscriptions = []
  } = finance;

  const alerts = [];

  const totalBudget = Math.max(1, num(budget));
  const totalSpent = Math.max(0, num(expenses));

  const percentage = (totalSpent / totalBudget) * 100;

  if (percentage >= 100) {
    alerts.push({
      id: "budget-exceeded",
      type: "danger",
      title: "Monthly Budget Exceeded",
      message:
        "You've spent more than your monthly budget. Review your expenses.",
      priority: 1
    });
  } else if (percentage >= 90) {
    alerts.push({
      id: "budget-critical",
      type: "danger",
      title: "Budget Almost Exhausted",
      message:
        `You've used ${Math.round(percentage)}% of your monthly budget.`,
      priority: 1
    });
  } else if (percentage >= 75) {
    alerts.push({
      id: "budget-warning",
      type: "warning",
      title: "75% Budget Used",
      message:
        "Consider limiting non-essential spending for the rest of the month.",
      priority: 2
    });
  } else if (percentage >= 50) {
    alerts.push({
      id: "budget-half",
      type: "info",
      title: "Halfway Through Your Budget",
      message:
        `You've spent ${Math.round(percentage)}% of your budget.`,
      priority: 3
    });
  }

  const remainingDays = Math.max(
    0,
    30 - num(currentDay)
  );

  const available = num(balance) - num(savings);

  if (available < 0) {
    alerts.push({
      id: "negative-available",
      type: "danger",
      title: "Insufficient Available Funds",
      message:
        "Your reserved savings exceed your remaining balance.",
      priority: 1
    });
  } else if (
    remainingDays > 0 &&
    available / remainingDays < 100
  ) {
    alerts.push({
      id: "low-daily-allowance",
      type: "warning",
      title: "Low Daily Allowance",
      message:
        `Only ${formatMoney(available / remainingDays)} is available per remaining day.`,
      priority: 2
    });
  }

  const activeSubscriptions = Array.isArray(subscriptions)
    ? subscriptions.filter(
        item =>
          item.status !== "paused" &&
          item.active !== false &&
          item.is_active !== false
      )
    : [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const subscription of activeSubscriptions) {
    const dateValue =
      subscription.nextPaymentDate ??
      subscription.next_payment_date ??
      subscription.nextBillingDate ??
      subscription.next_billing_date;

    if (!dateValue) continue;

    const dueDate = new Date(
      `${String(dateValue).slice(0, 10)}T00:00:00`
    );

    if (Number.isNaN(dueDate.getTime())) continue;

    const daysUntil = Math.ceil(
      (dueDate - today) / 86400000
    );

    if (daysUntil >= 0 && daysUntil <= 3) {
      alerts.push({
        id: `subscription-${subscription.id}`,
        type: daysUntil === 0 ? "warning" : "info",
        title: `${subscription.name || "Subscription"} Payment Due`,
        message:
          daysUntil === 0
            ? `Payment of ${formatMoney(subscription.amount)} is due today.`
            : `Payment of ${formatMoney(subscription.amount)} is due in ${daysUntil} day(s).`,
        priority: daysUntil === 0 ? 2 : 3
      });
    }
  }

  return alerts.sort(
    (a, b) => a.priority - b.priority
  );
}

export default getBudgetAlerts;
