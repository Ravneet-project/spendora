

import { useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { useFinance } from "../context/FinanceContext";
import useIncomeBudget from "../hooks/useIncomeBudget";

import {

  budgetCategories,

  defaultBudgetPlan,

  formatMoney,

  getPlannedTotal,

  readBudgetPlan,

  saveBudgetPlan,

  safeNumber

} from "../utils/budgetPlan";

import "../styles/simulator-premium.css";



export default function Simulator() {

  const finance = useFinance();
  const { totalIncome, savingsTarget, spendingBudget } = useIncomeBudget();



  const [plan, setPlan] = useState(readBudgetPlan);

  const [extraExpense, setExtraExpense] = useState(0);

  const [extraIncome, setExtraIncome] = useState(0);

  const [saveMore, setSaveMore] = useState(0);



  const budget = spendingBudget;



  const currentBalance = safeNumber(

    finance.balance ?? safeNumber(finance.budget ?? 0)

  );



  const savings = safeNumber(finance.savings);



  const actualExpenses = safeNumber(

    finance.expenses ??

      (Array.isArray(finance.transactions)

        ? finance.transactions

            .filter(

              (item) =>

                String(item.type).toLowerCase() !==

                "income"

            )

            .reduce(

              (sum, item) =>

                sum + Math.abs(safeNumber(item.amount)),

              0

            )

        : 0)

  );



  const day = Math.max(

    1,

    Math.min(30, safeNumber(finance.currentDay ?? 10))

  );



  const daysLeft = 30 - day;



  const plannedTotal = useMemo(

    () => getPlannedTotal(plan),

    [plan]

  );



  // Plan is a full-month target, not extra spending.
  const plannedRemaining = budget - plannedTotal;



  // Remaining planned expenses after spending already recorded.
  const futurePlannedExpenses = Math.max(

    0,

    plannedTotal - actualExpenses

  );



  const baselineForecast =

    currentBalance -

    savings -

    futurePlannedExpenses;



  const simulatedForecast =

    baselineForecast +

    extraIncome -

    extraExpense -

    saveMore;



  const difference =

    simulatedForecast - baselineForecast;



  const dailyAllowance =

    daysLeft > 0

      ? Math.max(0, simulatedForecast / daysLeft)

      : 0;



  const updateCategory = (key, value) => {

    const updated = {

      ...plan,

      [key]: Math.max(0, safeNumber(value))

    };



    setPlan(updated);

    saveBudgetPlan(updated);

  };



  const resetScenario = () => {

    setExtraExpense(0);

    setExtraIncome(0);

    setSaveMore(0);

  };



  const resetAll = () => {

    const updated = { ...defaultBudgetPlan };

    setPlan(updated);

    saveBudgetPlan(updated);

    resetScenario();

  };



  const scenarios = [

    {

      label: "Unexpected Expense",

      icon: "bi-bag-x",

      value: extraExpense,

      setter: setExtraExpense,

      color: "peach"

    },

    {

      label: "Extra Income",

      icon: "bi-cash-coin",

      value: extraIncome,

      setter: setExtraIncome,

      color: "mint"

    },

    {

      label: "Additional Savings",

      icon: "bi-piggy-bank",

      value: saveMore,

      setter: setSaveMore,

      color: "purple"

    }

  ];



  return (

    <div className="sp-simulator container-fluid px-0">

      <div className="sp-sim-hero">

        <div>

          <span className="sp-sim-kicker">

            <i className="bi bi-stars" />

            SMART FINANCIAL SIMULATION

          </span>



          <h1>What if you changed your spending?</h1>



          <p>

            Explore financial decisions before making them.

            Your real balance stays untouched.

          </p>



          <Link to="/" className="sp-sim-back">

            <i className="bi bi-arrow-left" />

            Back to Dashboard

          </Link>

        </div>



        <div className="sp-sim-hero-icon">

          <i className="bi bi-lightning-charge" />

        </div>

      </div>



      <div className="row g-3 mt-1">

        <div className="col-12 col-md-4">

          <div className="sp-sim-stat">

            <i className="bi bi-wallet2" />

            <span>Current Balance</span>

            <strong>{formatMoney(currentBalance)}</strong>

          </div>

        </div>



        <div className="col-12 col-md-4">

          <div className="sp-sim-stat">

            <i className="bi bi-calendar3" />

            <span>Remaining Days</span>

            <strong>{daysLeft} days</strong>

          </div>

        </div>



        <div className="col-12 col-md-4">

          <div className="sp-sim-stat">

            <i className="bi bi-piggy-bank" />

            <span>Reserved Savings</span>

            <strong>{formatMoney(savings)}</strong>

          </div>

        </div>

      </div>



      <div className="row g-3 mt-1">

        <div className="col-12 col-xl-7">

          <section className="sp-sim-panel">

            <div className="sp-sim-panel-head">

              <div>

                <h2>

                  <i className="bi bi-sliders2" />

                  Monthly Budget Plan

                </h2>

                <p>

                  Changes sync with your Dashboard planner.

                </p>

              </div>



              <span className="sp-sim-tag">

                {formatMoney(plannedTotal)}

              </span>

            </div>



            {budgetCategories.map((category) => (

              <div

                className="sp-sim-category"

                key={category.key}

              >

                <div className="sp-sim-category-head">

                  <div>

                    <i

                      className={`bi ${category.icon}`}

                    />

                    <strong>{category.label}</strong>

                  </div>



                  <span>

                    {formatMoney(plan[category.key])}

                  </span>

                </div>



                <input

                  type="range"

                  className="form-range"

                  min="0"

                  max={Math.max(10000, budget, plan[category.key])}

                  step="100"

                  value={plan[category.key]}

                  onChange={(event) =>

                    updateCategory(

                      category.key,

                      event.target.value

                    )

                  }

                />

              </div>

            ))}



            <div className="sp-sim-plan-summary">

              <div>

                <span>Monthly Budget</span>

                <strong>{formatMoney(budget)}</strong>

              </div>



              <div>

                <span>Planned Total</span>

                <strong>

                  {formatMoney(plannedTotal)}

                </strong>

              </div>



              <div>

                <span>Unallocated Budget</span>

                <strong

                  className={

                    plannedRemaining < 0

                      ? "sp-sim-negative"

                      : ""

                  }

                >

                  {formatMoney(plannedRemaining)}

                </strong>

              </div>

            </div>

          </section>

        </div>



        <div className="col-12 col-xl-5">

          <section className="sp-sim-panel h-100">

            <div className="sp-sim-panel-head">

              <div>

                <h2>

                  <i className="bi bi-magic" />

                  Try a Scenario

                </h2>

                <p>Adjust hypothetical amounts.</p>

              </div>

            </div>



            {scenarios.map((scenario) => (

              <div

                className="sp-sim-scenario"

                key={scenario.label}

              >

                <label>

                  <i

                    className={`bi ${scenario.icon}`}

                  />

                  {scenario.label}

                </label>



                <div className="input-group">

                  <span className="input-group-text">

                    â‚¹

                  </span>



                  <input

                    type="number"

                    min="0"

                    step="100"

                    className="form-control"

                    value={scenario.value}

                    onChange={(event) =>

                      scenario.setter(

                        Math.max(

                          0,

                          safeNumber(event.target.value)

                        )

                      )

                    }

                  />

                </div>

              </div>

            ))}



            <button

              type="button"

              className="btn sp-sim-reset"

              onClick={resetScenario}

            >

              <i className="bi bi-arrow-counterclockwise" />

              Reset Scenario

            </button>

          </section>

        </div>

      </div>



      <div className="row g-3 mt-1">

        <div className="col-12 col-lg-6">

          <div className="sp-sim-result">

            <span>BASELINE PLAN FORECAST</span>



            <strong>

              {formatMoney(baselineForecast)}

            </strong>



            <p>

              Estimated available balance after

              planned remaining expenses and

              reserved savings.

            </p>

          </div>

        </div>



        <div className="col-12 col-lg-6">

          <div className="sp-sim-result sp-sim-result-active">

            <span>WHAT-IF FORECAST</span>



            <strong>

              {formatMoney(simulatedForecast)}

            </strong>



            <p>

              {difference >= 0 ? "+" : ""}

              {formatMoney(difference)} compared

              with your baseline plan.

            </p>

          </div>

        </div>

      </div>



      <div className="sp-sim-insight">

        <div className="sp-sim-insight-icon">

          <i

            className={`bi ${

              simulatedForecast < 0

                ? "bi-exclamation-triangle"

                : "bi-shield-check"

            }`}

          />

        </div>



        <div>

          <h3>

            {simulatedForecast < 0

              ? "Your plan needs adjustment"

              : "Your scenario stays within available funds"}

          </h3>



          <p>

            {simulatedForecast < 0

              ? "The scenario projects a shortfall. Try reducing planned expenses or increasing income."

              : `Estimated safe allowance: ${formatMoney(

                  dailyAllowance

                )} per remaining day.`}

          </p>

        </div>

      </div>



      <div className="sp-sim-bottom">

        <button

          type="button"

          className="btn sp-sim-reset"

          onClick={resetAll}

        >

          <i className="bi bi-arrow-repeat" />

          Reset Plan and Scenario

        </button>



        <span>

          <i className="bi bi-lock" />

          No actual transactions are changed.

        </span>

      </div>



      <p className="sp-sim-disclaimer">

        This forecast is a simplified educational

        estimate. The monthly plan is treated as a

        total spending target; recorded expenses

        are subtracted from that target to estimate

        future planned spending. Subscription payments

        should be included in your Bills plan rather

        than counted again. Forecasts are not guarantees.

      </p>

    </div>

  );

}
