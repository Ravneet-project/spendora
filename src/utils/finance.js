
export const formatMoney = (amount) =>
  "₹" + Math.round(amount).toLocaleString("en-IN");

export function calculateScenario({
  budget = 10000,
  spent = 2800,
  currentDay = 10,
  purchase = 0,
  bills = 1500,
  savings = 1200,
  emergency = 0,
  dailySpend = 150,
}) {
  const daysLeft = Math.max(0, 30 - currentDay);

  const balance = budget - spent;
  const totalCommitments = purchase + bills + savings + emergency;

  const available = balance - totalCommitments;

  const dailyAllowance =
    daysLeft > 0 ? Math.max(0, available / daysLeft) : 0;

  const forecast = available - dailySpend * daysLeft;

  const savingsProgress = Math.min(
    100,
    Math.max(0, (savings / 3000) * 100)
  );

  const survivalRatio =
    daysLeft > 0 && dailySpend > 0
      ? available / (dailySpend * daysLeft)
      : available >= 0 ? 1 : 0;

  let risk = "Low";
  if (available < 0 || survivalRatio < 0.75) {
    risk = "High";
  } else if (survivalRatio < 1.2) {
    risk = "Moderate";
  }

  const spendingPenalty = Math.max(
    0,
    ((spent + purchase) / budget) * 25
  );

  const forecastPenalty =
    forecast < 0
      ? Math.min(40, (Math.abs(forecast) / budget) * 100)
      : 0;

  const emergencyPenalty = emergency > 0 ? 8 : 0;

  const healthScore = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        95 - spendingPenalty - forecastPenalty -
        emergencyPenalty + savingsProgress * 0.1
      )
    )
  );

  return {
    balance,
    available,
    daysLeft,
    dailyAllowance,
    forecast,
    savingsProgress,
    healthScore,
    risk,
    totalCommitments,
  };
}
