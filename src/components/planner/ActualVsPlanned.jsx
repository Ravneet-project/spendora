import { useEffect, useMemo, useState } from "react";
import { budgetCategories, formatMoney, readBudgetPlan, BUDGET_PLAN_KEY } from "../../utils/budgetPlan";

const aliases = {
  food: ["food", "food & drinks", "food and drinks", "groceries", "dining", "restaurant"],
  travel: ["travel", "transport", "transportation", "fuel", "cab"],
  shopping: ["shopping", "clothes", "fashion"],
  bills: ["bills", "utilities", "rent", "subscription", "subscriptions"],
  other: ["other", "misc", "miscellaneous", "general"]
};
function categoryKey(name) {
  const n = String(name || "other").trim().toLowerCase();
  return Object.keys(aliases).find((key) => aliases[key].includes(n)) || "other";
}
export default function ActualVsPlanned({ transactions = [] }) {
  const [plan, setPlan] = useState(readBudgetPlan);
  useEffect(() => {
    const refresh = () => setPlan(readBudgetPlan());
    const onStorage = (event) => { if (event.key === BUDGET_PLAN_KEY) refresh(); };
    window.addEventListener("spendora:budget-plan-updated", refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("spendora:budget-plan-updated", refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const rows = useMemo(() => {
    const actual = Object.fromEntries(budgetCategories.map((c) => [c.key, 0]));
    for (const tx of transactions) {
      if (String(tx.type || "expense").toLowerCase() === "income") continue;
      const key = categoryKey(tx.category);
      const amount = Math.abs(Number(tx.amount) || 0);
      actual[key] += amount;
    }
    return budgetCategories.map((c) => ({ ...c, planned: Number(plan[c.key]) || 0, actual: actual[c.key] }));
  }, [transactions, plan]);
  return (
    <section className="sd-panel">
      <div className="sd-panel-heading">
        <div className="sd-panel-heading-main">
          <div className="sd-panel-icon"><i className="bi bi-bar-chart-line" /></div>
          <div><h3>Actual vs Planned Spending</h3><p>Compare recorded transactions with your category targets</p></div>
        </div>
      </div>
      <div className="row g-3">
        {rows.map((item) => {
          const percent = item.planned > 0 ? (item.actual / item.planned) * 100 : item.actual > 0 ? 100 : 0;
          const over = item.actual > item.planned;
          return (
            <div className="col-12 col-md-6" key={item.key}>
              <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                <span className="small fw-semibold"><i className={`bi ${item.icon} me-2 text-secondary`} />{item.label}</span>
                <span className={`small fw-semibold ${over ? "text-danger" : ""}`}>{formatMoney(item.actual)} / {formatMoney(item.planned)}</span>
              </div>
              <div className="progress" style={{ height: 9, background: "#f0ebfa" }}>
                <div className={`progress-bar ${over ? "bg-danger" : ""}`}
                  style={{ width: `${Math.min(100, percent)}%`, background: over ? undefined : "#8667eb" }} />
              </div>
              <div className="small mt-1 text-secondary">{over ? `Over by ${formatMoney(item.actual - item.planned)}` : `${formatMoney(item.planned - item.actual)} left`}</div>
            </div>
          );
        })}
      </div>
      <p className="small text-secondary mt-3 mb-0"><i className="bi bi-info-circle me-2" />This comparison uses all supplied expense transactions. Category names outside the recognized groups are counted as Other.</p>
    </section>
  );
}
