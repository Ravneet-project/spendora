import { useMemo } from "react";

import { Link } from "react-router-dom";

import BudgetPlanner from "../components/planner/BudgetPlanner";

import IncomeSetup from "../components/income/IncomeSetup";

import {

  AreaChart,

  Area,

  CartesianGrid,

  XAxis,

  YAxis,

  Tooltip,

  ResponsiveContainer,

  PieChart,

  Pie,

  Cell

} from "recharts";

import { useFinance } from "../context/FinanceContext";

import useIncomeBudget from "../hooks/useIncomeBudget";

import ActualVsPlanned from "../components/planner/ActualVsPlanned";

import { calculateFinancialHealth } from "../utils/health";

import BudgetAlerts from "../components/dashboard/BudgetAlerts";

import "../styles/dashboard-premium.css";

import {

  Sparkles, Plus, SlidersHorizontal, TrendingUp, Wallet, CreditCard,

  Banknote, PiggyBank, ChartNoAxesCombined, ChartPie, CalendarCheck,

  Coffee, Hourglass, HeartPulse, ShieldCheck, ArrowUpRight, ArrowRight,

  ArrowDownLeft, ReceiptText, CalendarDays, Repeat2, Info,

  UtensilsCrossed, BusFront, ShoppingBag

} from "lucide-react";





const money = (value) =>

  new Intl.NumberFormat("en-IN", {

    style: "currency",

    currency: "INR",

    maximumFractionDigits: 0

  }).format(Number(value) || 0);

const num = (value) => {

  const n = Number(value);

  return Number.isFinite(n) ? n : 0;

};

const getTransactionIcon = (category) => {

  const name = String(category || "").toLowerCase();

  if (name.includes("food") || name.includes("dining")) return UtensilsCrossed;

  if (name.includes("travel") || name.includes("transport")) return BusFront;

  if (name.includes("shop") || name.includes("grocer")) return ShoppingBag;

  if (name.includes("bill") || name.includes("subscription")) return ReceiptText;

  return Wallet;

};



const COLORS = [

  "#8667eb",

  "#69c9ae",

  "#ffbb83",

  "#85b8ee",

  "#f18eaa",

  "#a5a0d8"

];

const getDate = (value) => {

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;

};

function StatCard({

  title,

  value,

  icon,

  tone,

  subtitle,

  progress

}) {

  const Icon = icon;

  return (

    <div className="col-12 col-sm-6 col-xl-3">

      <div className={`sd-stat sd-${tone}`}>

        <div className="sd-stat-top">

          <span>{title}</span>

          <div className="sd-stat-icon">

            {Icon && <Icon size={21} strokeWidth={2} aria-hidden="true" />}

          </div>

        </div>

        <div className="sd-stat-value">{value}</div>

        <div className="sd-stat-sub">{subtitle}</div>

        {progress !== undefined && (

          <div className="sd-mini-progress">

            <div

              style={{

                width: `${Math.max(

                  0,

                  Math.min(100, progress)

                )}%`

              }}

            />

          </div>

        )}

      </div>

    </div>

  );

}

function PanelTitle({ icon, title, subtitle, action }) {

  const Icon = icon;

  return (

    <div className="sd-panel-heading">

      <div className="sd-panel-heading-main">

        <div className="sd-panel-icon">

          {Icon && <Icon size={21} strokeWidth={2} aria-hidden="true" />}

        </div>

        <div>

          <h3>{title}</h3>

          <p>{subtitle}</p>

        </div>

      </div>

      {action}

    </div>

  );

}

export default function Dashboard() {

  const finance = useFinance();

  const { totalIncome, savingsTarget, spendingBudget } = useIncomeBudget();

  const budget = spendingBudget;

  const balance = num(finance.balance);

  const savings = num(finance.savings);

  const transactions = Array.isArray(finance.transactions)

    ? finance.transactions

    : [];

  const subscriptions = Array.isArray(finance.subscriptions)

    ? finance.subscriptions

    : [];

  const expenses = Array.isArray(finance.expenses)

    ? finance.expenses.reduce((sum, item) => sum + Math.abs(num(item.amount)), 0)

    : finance.expenses != null

      ? num(finance.expenses)

      : transactions.filter((item) => String(item.type).toLowerCase() !== "income")

          .reduce((sum, item) => sum + Math.abs(num(item.amount)), 0);

  const income = num(finance.income); // Recorded transactions only

  const day = Math.max(

    1,

    Math.min(30, num(finance.currentDay ?? 10))

  );

  const health = useMemo(

    () =>

      calculateFinancialHealth({

        budget,

        income,

        expenses,

        balance,

        savings,

        savingsGoal: num(finance.savingsGoal),

        currentDay: day,

        subscriptions,

        transactions

      }),

    [

      budget,

      income,

      expenses,

      balance,

      savings,

      savingsTarget,

      day,

      subscriptions,

      transactions

    ]

  );

  const spendingPercent =

    budget > 0 ? (expenses / budget) * 100 : 0;

  const available = balance - savings;

  const categoryData = useMemo(() => {

    const grouped = {};

    transactions.forEach((item) => {

      if (String(item.type).toLowerCase() === "income") {

        return;

      }

      const category = String(

        item.category || "Other"

      );

      grouped[category] =

        (grouped[category] || 0) +

        Math.abs(num(item.amount));

    });

    return Object.entries(grouped)

      .map(([name, value]) => ({ name, value }))

      .filter((item) => item.value > 0)

      .sort((a, b) => b.value - a.value);

  }, [transactions]);

  const chartData = useMemo(() => {

    const today = new Date();

    const days = Array.from({ length: 7 }, (_, i) => {

      const date = new Date(today);

      date.setDate(today.getDate() - (6 - i));

      const key = [

        date.getFullYear(),

        String(date.getMonth() + 1).padStart(2, "0"),

        String(date.getDate()).padStart(2, "0")

      ].join("-");

      return {

        key,

        day: date.toLocaleDateString("en-IN", {

          weekday: "short"

        }),

        amount: 0

      };

    });

    transactions.forEach((item) => {

      if (String(item.type).toLowerCase() === "income") {

        return;

      }

      const date = getDate(

        item.date || item.createdAt || item.created_at

      );

      if (!date) return;

      const key = [

        date.getFullYear(),

        String(date.getMonth() + 1).padStart(2, "0"),

        String(date.getDate()).padStart(2, "0")

      ].join("-");

      const entry = days.find((d) => d.key === key);

      if (entry) {

        entry.amount += Math.abs(num(item.amount));

      }

    });

    return days;

  }, [transactions]);

  const recentTransactions = useMemo(

    () =>

      [...transactions]

        .sort((a, b) => {

          const da = getDate(

            a.date || a.createdAt || a.created_at

          );

          const db = getDate(

            b.date || b.createdAt || b.created_at

          );

          return (db?.getTime() || 0) -

            (da?.getTime() || 0);

        })

        .slice(0, 5),

    [transactions]

  );

  const upcoming = useMemo(() => {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return subscriptions

      .filter(

        (item) =>

          item.status !== "paused" &&

          item.active !== false &&

          item.is_active !== false

      )

      .map((item) => {

        const date = getDate(

          item.nextDate ||
            item.nextPaymentDate ||

          item.next_payment_date ||

          item.nextBillingDate ||

          item.next_billing_date

        );

        return { ...item, parsedDate: date };

      })

      .filter(

        (item) =>

          item.parsedDate &&

          item.parsedDate >= today

      )

      .sort(

        (a, b) =>

          a.parsedDate.getTime() -

          b.parsedDate.getTime()

      )

      .slice(0, 4);

  }, [subscriptions]);

  const riskTone =

    health.risk === "High"

      ? "danger"

      : health.risk === "Moderate"

      ? "warning"

      : "success";

  return (

    <div className="sd-dashboard container-fluid px-0">

      <div className="sd-hero">

        <div className="sd-hero-content">

          <div className="sd-eyebrow">

            <Sparkles size={18} strokeWidth={2} aria-hidden="true" />

            YOUR FINANCIAL SPACE

          </div>

          <h1>

            Make every rupee

            <span> work smarter.</span>

          </h1>

          <p>

            Track your spending, protect your savings

            and stay in control of your 30-day challenge.

          </p>

          <div className="sd-hero-actions">

            <Link

              to="/transactions"

              className="sd-primary-btn"

            >

              <Plus size={18} strokeWidth={2} aria-hidden="true" />

              Add Transaction

            </Link>

            <Link

              to="/simulator"

              className="sd-outline-btn"

            >

              <SlidersHorizontal size={18} strokeWidth={2} aria-hidden="true" />

              Try Simulator

            </Link>

          </div>

        </div>

        <div className="sd-hero-graphic">

          <div className="sd-floating-card">

            <TrendingUp size={18} strokeWidth={2} aria-hidden="true" />

            <div>

              <span>Available to spend</span>

              <strong>{money(available)}</strong>

            </div>

          </div>

          <div className="sd-hero-orb">

            <Wallet size={18} strokeWidth={2} aria-hidden="true" />

          </div>

        </div>

      </div>

<div className="mt-4 mb-4">

  <IncomeSetup />

</div>

      <div className="row g-3 mb-3" aria-label="Planned versus actual income">
        <div className="col-12 col-md-6">
          <div className="sd-panel" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
              <Wallet size={18} color="#8062e8" />
              <strong>Planned Monthly Income</strong>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{money(totalIncome)}</div>
            <small style={{ color: "#807995" }}>From Income Setup · planning only</small>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="sd-panel" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
              <Banknote size={18} color="#159c77" />
              <strong>Actual Income Received</strong>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{money(income)}</div>
            <small style={{ color: "#807995" }}>From recorded income transactions</small>
          </div>
        </div>
      </div>
      <div className="row g-3 sd-stats-row">

        <StatCard

          title="Planned Spending Budget"

          value={money(budget)}

          icon={Wallet}

          tone="purple"

          subtitle="Planned income minus savings target"

        />

        <StatCard

          title="Total Expenses"

          value={money(expenses)}

          icon={CreditCard}

          tone="peach"

          subtitle={`${Math.round(spendingPercent)}% of budget used`}

          progress={spendingPercent}

        />

        <StatCard

          title="Current Balance"

          value={money(balance)}

          icon={Banknote}

          tone="mint"

          subtitle="Before reserved savings"

        />

        <StatCard

          title="Reserved Savings"

          value={money(savings)}

          icon={PiggyBank}

          tone="blue"

          subtitle="Set aside for your goals"

        />

      </div>

      <div className="row g-3 mt-1">

        <div className="col-12 col-xl-8">

          <div className="sd-panel h-100">

            <PanelTitle

              icon={ChartNoAxesCombined}

              title="Spending Analytics"

              subtitle="Your expenses over the last 7 days"

              action={

                <span className="sd-soft-tag">

                  Last 7 days

                </span>

              }

            />

            <div className="sd-chart-area">

              <ResponsiveContainer width="100%" height="100%">

                <AreaChart

                  data={chartData}

                  margin={{

                    top: 10,

                    right: 12,

                    left: -20,

                    bottom: 0

                  }}

                >

                  <defs>

                    <linearGradient

                      id="sdChartGradient"

                      x1="0"

                      y1="0"

                      x2="0"

                      y2="1"

                    >

                      <stop

                        offset="0%"

                        stopColor="#8667eb"

                        stopOpacity={0.24}

                      />

                      <stop

                        offset="95%"

                        stopColor="#8667eb"

                        stopOpacity={0}

                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid

                    stroke="#f0edf7"

                    vertical={false}

                  />

                  <XAxis

                    dataKey="day"

                    axisLine={false}

                    tickLine={false}

                    tick={{ fill: "#a29bb0", fontSize: 11 }}

                  />

                  <YAxis

                    axisLine={false}

                    tickLine={false}

                    tick={{ fill: "#a29bb0", fontSize: 11 }}

                  />

                  <Tooltip

                    formatter={(value) => money(value)}

                    contentStyle={{

                      borderRadius: 12,

                      border: "1px solid #eeeaf6"

                    }}

                  />

                  <Area

                    type="monotone"

                    dataKey="amount"

                    stroke="#8667eb"

                    strokeWidth={3}

                    fill="url(#sdChartGradient)"

                    activeDot={{ r: 5 }}

                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

        <div className="col-12 col-xl-4">

          <div className="sd-panel h-100">

            <PanelTitle

              icon={ChartPie}

              title="Expense Breakdown"

              subtitle="Where your money goes"

            />

            {categoryData.length ? (

              <>

                <div className="sd-donut-area">

                  <ResponsiveContainer

                    width="100%"

                    height="100%"

                  >

                    <PieChart>

                      <Pie

                        data={categoryData}

                        dataKey="value"

                        nameKey="name"

                        innerRadius={66}

                        outerRadius={88}

                        paddingAngle={3}

                      >

                        {categoryData.map((item, index) => (

                          <Cell

                            key={item.name}

                            fill={

                              COLORS[index % COLORS.length]

                            }

                          />

                        ))}

                      </Pie>

                      <Tooltip

                        formatter={(value) => money(value)}

                      />

                    </PieChart>

                  </ResponsiveContainer>

                  <div className="sd-donut-center">

                    <small>Total spent</small>

                    <strong>{money(expenses)}</strong>

                  </div>

                </div>

                <div className="sd-category-list">

                  {categoryData.slice(0, 5).map((item, i) => (

                    <div

                      className="sd-category-row"

                      key={item.name}

                    >

                      <div>

                        <span

                          className="sd-category-dot"

                          style={{

                            background:

                              COLORS[i % COLORS.length]

                          }}

                        />

                        {item.name}

                      </div>

                      <strong>{money(item.value)}</strong>

                    </div>

                  ))}

                </div>

              </>

            ) : (

              <div className="sd-empty">

                <ChartPie size={18} strokeWidth={2} aria-hidden="true" />

                <p>

                  Add expense transactions to see

                  your category breakdown.

                </p>

              </div>

            )}

          </div>

        </div>

      </div>

      <div className="row g-3 mt-1">

        <div className="col-12 col-xl-8">

          <div className="sd-panel h-100">

            <PanelTitle

              icon={CalendarCheck}

              title="30-Day Survival Challenge"

              subtitle="Your financial progress this month"

            />

            <div className="sd-challenge-head">

              <div>

                <span>Challenge Progress</span>

                <strong>Day {day} of 30</strong>

              </div>

              <span className="sd-soft-tag">

                {30 - day} days left

              </span>

            </div>

            <div className="sd-challenge-progress">

              <div

                style={{

                  width: `${(day / 30) * 100}%`

                }}

              />

            </div>

            <div className="row g-3 mt-2">

              <div className="col-12 col-md-4">

                <div className="sd-challenge-metric">

                  <Coffee size={18} strokeWidth={2} aria-hidden="true" />

                  <span>Daily Allowance</span>

                  <strong>

                    {money(health.dailyAllowance)}

                  </strong>

                </div>

              </div>

              <div className="col-12 col-md-4">

                <div className="sd-challenge-metric">

                  <Hourglass size={18} strokeWidth={2} aria-hidden="true" />

                  <span>Survival Runway</span>

                  <strong>

                    {health.survivalDays} days

                  </strong>

                </div>

              </div>

              <div className="col-12 col-md-4">

                <div className="sd-challenge-metric">

                  <TrendingUp size={18} strokeWidth={2} aria-hidden="true" />

                  <span>Month-End Forecast</span>

                  <strong>

                    {money(health.projectedBalance)}

                  </strong>

                </div>

              </div>

            </div>

            <div className="sd-challenge-note">

              <Info size={18} strokeWidth={2} aria-hidden="true" />

              Challenge day is controlled by your

              existing finance settings. Forecasts

              are estimates, not guaranteed outcomes.

            </div>

          </div>

        </div>

        <div className="col-12 col-xl-4">

          <div className="sd-panel h-100">

            <PanelTitle

              icon={HeartPulse}

              title="Financial Wellness"

              subtitle="Your financial health at a glance"

              action={

                <Link to="/health" className="sd-text-link">

                  Details

                  <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />

                </Link>

              }

            />

            <div className="sd-health-display">

              <div

                className="sd-health-ring"

                style={{

                  "--sd-score": `${health.healthScore}%`

                }}

              >

                <div>

                  <strong>{health.healthScore}</strong>

                  <small>/ 100</small>

                </div>

              </div>

              <span

                className={`sd-risk sd-risk-${riskTone}`}

              >

                <ShieldCheck size={18} strokeWidth={2} aria-hidden="true" />

                {health.risk} Risk

              </span>

              <p>

                Based on your current spending,

                savings and projected commitments.

              </p>

            </div>

          </div>

        </div>

      </div>

      <div className="mt-3">

        <BudgetAlerts />

      </div>

      <div className="row g-3 mt-1">

        <div className="col-12 col-xl-7">

          <div className="sd-panel h-100">

            <PanelTitle

              icon={ReceiptText}

              title="Recent Transactions"

              subtitle="Your latest financial activity"

              action={

                <Link

                  to="/transactions"

                  className="sd-text-link"

                >

                  View all

                  <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />

                </Link>

              }

            />

            {recentTransactions.length ? (

              <div className="sd-transaction-list">

                {recentTransactions.map((item, index) => {

                  const isIncome =

                    String(item.type).toLowerCase() ===

                    "income";

                  const CategoryIcon = getTransactionIcon(item.category);

                  const date = getDate(

                    item.date ||

                    item.createdAt ||

                    item.created_at

                  );

                  return (

                    <div

                      className="sd-transaction"

                      key={item.id ?? index}

                    >

                      <div

                        className={

                          "sd-transaction-icon " +

                          (isIncome ? "income" : "expense")

                        }

                      >

                        {isIncome ? <ArrowDownLeft size={19} /> : <CategoryIcon size={19} />}

                      </div>

                      <div className="sd-transaction-info">

                        <strong>

                          {item.title ||

                            item.name ||

                            item.description ||

                            item.category ||

                            "Transaction"}

                        </strong>

                        <span>

                          {item.category || "General"}

                          {date

                            ? ` • ${date.toLocaleDateString(

                                "en-IN",

                                {

                                  day: "numeric",

                                  month: "short"

                                }

                              )}`

                            : ""}

                        </span>

                      </div>

                      <strong

                        className={

                          "sd-transaction-amount " +

                          (isIncome ? "income" : "expense")

                        }

                      >

                        {isIncome ? "+" : "-"}

                        {money(Math.abs(num(item.amount)))}

                      </strong>

                    </div>

                  );

                })}

              </div>

            ) : (

              <div className="sd-empty">

                <ReceiptText size={18} strokeWidth={2} aria-hidden="true" />

                <p>No transactions recorded yet.</p>

                <Link to="/transactions">

                  Add your first transaction

                </Link>

              </div>

            )}

          </div>

        </div>

        <div className="col-12 col-xl-5">

          <div className="sd-panel h-100">

            <PanelTitle

              icon={CalendarDays}

              title="Upcoming Bills"

              subtitle="Your next subscription payments"

              action={

                <Link

                  to="/subscriptions"

                  className="sd-text-link"

                >

                  Manage

                  <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />

                </Link>

              }

            />

            {upcoming.length ? (

              <div className="sd-bills-list">

                {upcoming.map((item, index) => (

                  <div

                    className="sd-bill"

                    key={item.id ?? index}

                  >

                    <div className="sd-bill-icon">

                      <Repeat2 size={18} strokeWidth={2} aria-hidden="true" />

                    </div>

                    <div className="sd-bill-info">

                      <strong>

                        {item.name || "Subscription"}

                      </strong>

                      <span>

                        {item.parsedDate.toLocaleDateString(

                          "en-IN",

                          {

                            day: "numeric",

                            month: "short",

                            year: "numeric"

                          }

                        )}

                      </span>

                    </div>

                    <strong>

                      {money(

                        item.amount ?? item.price

                      )}

                    </strong>

                  </div>

                ))}

              </div>

            ) : (

              <div className="sd-empty">

                <CalendarCheck size={18} strokeWidth={2} aria-hidden="true" />

                <p>

                  No upcoming dated subscriptions.

                </p>

              </div>

            )}

            <div className="sd-bill-footnote">

              <Info size={18} strokeWidth={2} aria-hidden="true" />

              Upcoming bills are reminders and are

              not automatically deducted.

            </div>

          </div>

        </div>

      </div>

<div className="mt-4">

  <BudgetPlanner />

          <ActualVsPlanned transactions={transactions} />

</div>

      <div className="sd-footer-note">

        <Sparkles size={18} strokeWidth={2} aria-hidden="true" />

        Small steps today. Big wins tomorrow.

        <span>Made for your money journey 💜</span>

      </div>

    </div>

  );

}
