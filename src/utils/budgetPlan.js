export const BUDGET_PLAN_KEY = "spendora_budget_plan_v1";

// Icons are rendered by lucide-react in BudgetPlanner.jsx.
// Keep the icon field for compatibility with any existing components.
export const budgetCategories = [
  { key: "food", label: "Food & Drinks", icon: "bi-cup-hot" },
  { key: "travel", label: "Travel", icon: "bi-car-front" },
  { key: "shopping", label: "Shopping", icon: "bi-bag-heart" },
  { key: "bills", label: "Bills", icon: "bi-receipt" },
  { key: "other", label: "Other", icon: "bi-grid" },
];

export const defaultBudgetPlan = {
  food: 1800,
  travel: 900,
  shopping: 1200,
  bills: 1500,
  other: 600,
};

export const safeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(safeNumber(value));

export function normalizeBudgetPlan(plan = {}) {
  return Object.fromEntries(
    budgetCategories.map(({ key }) => [
      key,
      Math.max(0, safeNumber(plan?.[key] ?? defaultBudgetPlan[key])),
    ])
  );
}

export function readBudgetPlan() {
  try {
    if (typeof window === "undefined") return { ...defaultBudgetPlan };
    const saved = window.localStorage.getItem(BUDGET_PLAN_KEY);
    return saved ? normalizeBudgetPlan(JSON.parse(saved)) : { ...defaultBudgetPlan };
  } catch {
    return { ...defaultBudgetPlan };
  }
}

export function saveBudgetPlan(plan) {
  const normalized = normalizeBudgetPlan(plan);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(BUDGET_PLAN_KEY, JSON.stringify(normalized));
    } catch {
      // Keep the current in-memory plan if browser storage is unavailable.
    }
    window.dispatchEvent(new CustomEvent("spendora:budget-plan-updated", { detail: normalized }));
  }
  return normalized;
}

export function getPlannedTotal(plan = {}) {
  return budgetCategories.reduce((sum, category) => sum + safeNumber(plan?.[category.key]), 0);
}
