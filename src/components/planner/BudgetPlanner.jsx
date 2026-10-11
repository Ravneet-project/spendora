
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Sparkles,
  SlidersHorizontal,
  UtensilsCrossed,
  CarFront,
  ShoppingBag,
  ReceiptText,
  LayoutGrid,
  TriangleAlert,
  CircleCheck,
  Zap,
  RotateCcw,
  Info,
} from "lucide-react";

import useIncomeBudget from "../../hooks/useIncomeBudget";

import {
  budgetCategories,
  defaultBudgetPlan,
  formatMoney,
  getPlannedTotal,
  readBudgetPlan,
  saveBudgetPlan,
  safeNumber,
} from "../../utils/budgetPlan";

import "../../styles/budget-planner.css";

const categoryIcons = {
  food: UtensilsCrossed,
  travel: CarFront,
  shopping: ShoppingBag,
  bills: ReceiptText,
  other: LayoutGrid,
};

export default function BudgetPlanner() {
  const navigate = useNavigate();

  const {
    totalIncome,
    savingsTarget,
    spendingBudget,
  } = useIncomeBudget();

  const [plan, setPlan] = useState(readBudgetPlan);

  const budget = Math.max(
    0,
    safeNumber(spendingBudget)
  );

  const total = getPlannedTotal(plan);
  const remaining = budget - total;

  const percentage =
    budget > 0
      ? (total / budget) * 100
      : total > 0
      ? 100
      : 0;

  function updatePlan(key, value) {
    const updated = {
      ...plan,
      [key]: Math.max(0, safeNumber(value)),
    };

    setPlan(updated);
    saveBudgetPlan(updated);
  }

  function resetPlan() {
    const updated = { ...defaultBudgetPlan };

    setPlan(updated);
    saveBudgetPlan(updated);
  }

  return (
    <section className="bp-card">
      <div className="bp-header">
        <div>
          <span className="bp-kicker">
            <Sparkles
              size={15}
              aria-hidden="true"
            />
            SMART MONEY PLANNER
          </span>

          <h2>Plan your monthly spending</h2>

          <p>
            Adjust your budget categories and
            test your plan in the What-If Simulator.
          </p>
        </div>

        <div className="bp-header-icon">
          <SlidersHorizontal
            size={24}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="bp-category-list">
            {budgetCategories.map((category) => {
              const CategoryIcon =
                categoryIcons[category.key] ||
                LayoutGrid;

              const amount = safeNumber(
                plan[category.key]
              );

              return (
                <div
                  className="bp-category"
                  key={category.key}
                >
                  <div className="bp-category-head">
                    <div className="bp-category-name">
                      <span className="bp-category-icon">
                        <CategoryIcon
                          size={19}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </span>

                      <strong>
                        {category.label}
                      </strong>
                    </div>

                    <span>
                      {formatMoney(amount)}
                    </span>
                  </div>

                  <input
                    type="range"
                    className="form-range bp-range"
                    min="0"
                    max={Math.max(
                      10000,
                      budget,
                      amount
                    )}
                    step="1"
                    value={amount}
                    onChange={(event) =>
                      updatePlan(
                        category.key,
                        event.target.value
                      )
                    }
                    aria-label={`${category.label} planned spending`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="bp-summary">
            <span className="bp-summary-label">
              MONTHLY PLAN
            </span>

            <div className="bp-summary-item">
              <span>Monthly Income</span>
              <strong>
                {formatMoney(totalIncome)}
              </strong>
            </div>

            <div className="bp-summary-item">
              <span>Savings Target</span>
              <strong>
                {formatMoney(savingsTarget)}
              </strong>
            </div>

            <div className="bp-summary-item">
              <span>Spending Budget</span>
              <strong>
                {formatMoney(budget)}
              </strong>
            </div>

            <div className="bp-summary-item">
              <span>Planned Expenses</span>
              <strong>
                {formatMoney(total)}
              </strong>
            </div>

            <div className="bp-divider" />

            <span className="bp-summary-label">
              UNALLOCATED SPENDING BUDGET
            </span>

            <div
              className={`bp-remaining ${
                remaining < 0
                  ? "bp-negative"
                  : ""
              }`}
            >
              {formatMoney(remaining)}
            </div>

            <div className="bp-progress-label">
              <span>Budget Utilization</span>

              <strong>
                {Math.round(percentage)}%
              </strong>
            </div>

            <div className="progress bp-progress">
              <div
                className={`progress-bar ${
                  remaining < 0
                    ? "bg-danger"
                    : ""
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, percentage)
                  )}%`,
                }}
              />
            </div>

            <div
              className={`bp-message ${
                remaining < 0
                  ? "bp-message-warning"
                  : ""
              }`}
            >
              {remaining < 0 ? (
                <TriangleAlert
                  size={17}
                  aria-hidden="true"
                />
              ) : (
                <CircleCheck
                  size={17}
                  aria-hidden="true"
                />
              )}

              <span>
                {remaining < 0
                  ? "Your planned spending exceeds your budget."
                  : "Your spending plan is within budget."}
              </span>
            </div>

            <button
              type="button"
              className="btn bp-reset"
              onClick={() =>
                navigate("/simulator")
              }
            >
              <Zap
                size={17}
                aria-hidden="true"
              />
              Test in What-If Simulator
            </button>

            <button
              type="button"
              className="btn bp-reset"
              onClick={resetPlan}
            >
              <RotateCcw
                size={17}
                aria-hidden="true"
              />
              Reset Plan
            </button>
          </div>
        </div>
      </div>

      <p className="bp-disclaimer">
        <Info
          size={15}
          aria-hidden="true"
        />
        Planning only. Actual transactions and
        balance are unchanged.
      </p>
    </section>
  );
}
