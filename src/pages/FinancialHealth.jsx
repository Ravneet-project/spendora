import { useMemo } from "react";
import { motion } from "motion/react";
import {
  HeartPulse, ShieldCheck, AlertTriangle, TrendingUp, Wallet,
  CalendarDays, Repeat2, Sparkles, PiggyBank, Lightbulb,
  Info, ArrowUpRight, Target, Activity
} from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import { financialHealth, money } from "../utils/health";
import "../styles/financial-health.css";

const safe = (value) => Number(value) || 0;
const cap = (value) => Math.min(100, Math.max(0, safe(value)));

export default function FinancialHealth() {
  const finance = useFinance();
  const result = useMemo(() => financialHealth(finance), [finance]);

  const score = cap(result.healthScore ?? result.score);
  const risk = result.risk || "Moderate";
  const riskClass = risk.toLowerCase();
  const forecast = safe(result.projectedBalance ?? result.forecast);
  const allowance = safe(result.dailyAllowance);
  const daysLeft = safe(result.daysLeft);
  const spentPerDay = safe(result.dailySpending);
  const subscriptions = safe(result.monthlySubscriptions);
  const reserved = safe(result.savings);
  const goal = safe(result.savingsGoal);
  const progress = cap(result.savingsProgress ?? (goal ? (reserved / goal) * 100 : 0));
  const balance = safe(result.balance ?? finance.balance);
  const subscriptionReserve = subscriptions * (daysLeft / 30);
  const insights = Array.isArray(result.insights) ? result.insights : [];

  const metrics = [
    { label: "Month-End Forecast", value: money(forecast), note: "Expected closing balance", Icon: TrendingUp, tone: "violet" },
    { label: "Safe Daily Allowance", value: money(allowance), note: "For each remaining day", Icon: Wallet, tone: "mint" },
    { label: "Survival Runway", value: `${safe(result.survivalDays)} days`, note: "At your current pace", Icon: CalendarDays, tone: "blue" },
    { label: "Monthly Subscriptions", value: money(subscriptions), note: "Active monthly commitments", Icon: Repeat2, tone: "peach" },
  ];

  return (
    <motion.div className="fh-page container-fluid px-0" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="fh-hero d-flex align-items-center justify-content-between gap-3">
        <div>
          <span className="fh-eyebrow"><Sparkles size={15} /> FINANCIAL WELLNESS</span>
          <h1>Your Financial Health <span aria-hidden="true">💜</span></h1>
          <p className="mb-0">See how today's spending decisions shape your 30-day money challenge.</p>
        </div>
        <div className="fh-hero-art d-none d-sm-flex"><HeartPulse size={52} strokeWidth={1.7} /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-5">
          <section className="fh-card fh-score-card h-100">
            <div className="fh-card-head d-flex justify-content-between align-items-start">
              <div><h2>Financial Health Score</h2><p>Your estimated money wellness</p></div>
              <span className="fh-head-icon"><Activity size={19} /></span>
            </div>
            <div className="fh-score-body">
              <div className="fh-score-ring" style={{ "--fh-score": `${score}%` }} role="img" aria-label={`Financial health score ${score} out of 100`}>
                <div className="fh-score-center"><strong>{Math.round(score)}</strong><span>out of 100</span></div>
              </div>
              <h3>{score >= 75 ? "You're doing great!" : score >= 45 ? "Room to improve" : "Time to take action"}</h3>
              <p>Calculated from spending pace, savings, future balance and subscriptions.</p>
              <span className={`fh-risk-pill ${riskClass}`}>
                {risk === "Low" ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
                {risk} Financial Risk
              </span>
            </div>
          </section>
        </div>
        <div className="col-12 col-xl-7">
          <section className="fh-card h-100">
            <div className="fh-card-head d-flex justify-content-between align-items-start">
              <div><h2>30-Day Financial Outlook</h2><p>Where your money could stand at month-end</p></div>
              <span className="fh-head-icon"><TrendingUp size={19} /></span>
            </div>
            <div className={`fh-forecast ${forecast < 0 ? "is-negative" : ""}`}>
              <span>Projected month-end balance</span>
              <strong>{money(forecast)}</strong>
              <small>{forecast >= 0 ? "On track to finish with money left" : "Your current pace may exceed available funds"}</small>
            </div>
            <div className="fh-outlook-list">
              <div><span>Current balance</span><strong>{money(balance)}</strong></div>
              <div><span>Reserved savings</span><strong>− {money(reserved)}</strong></div>
              <div><span>Estimated subscription reserve</span><strong>− {money(subscriptionReserve)}</strong></div>
              <div><span>Projected future expenses</span><strong>− {money(spentPerDay * daysLeft)}</strong></div>
            </div>
            <p className="fh-note mb-0"><Info size={14} /> Subscription reserve is a forecast, not an actual transaction.</p>
          </section>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {metrics.map(({ label, value, note, Icon, tone }) => (
          <div className="col-12 col-sm-6 col-xl-3" key={label}>
            <motion.div className="fh-metric h-100" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <span className={`fh-metric-icon ${tone}`}><Icon size={21} /></span>
              <span className="fh-metric-label">{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <section className="fh-card h-100">
            <div className="fh-card-head"><h2>Financial Risk Meter</h2><p>How safe is your current spending plan?</p></div>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <span className={`fh-risk-pill ${riskClass}`}>
                {risk === "Low" ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
                {risk} Risk
              </span>
              <span className="fh-small-muted">Live estimate <ArrowUpRight size={13} /></span>
            </div>
            <div className="fh-risk-track"><span style={{ left: risk === "Low" ? "16%" : risk === "Moderate" ? "50%" : "84%" }} /></div>
            <div className="fh-risk-labels"><span>Low</span><span>Moderate</span><span>High</span></div>
            <p className="fh-support-text mb-0 mt-4">{risk === "Low" ? "Nice work! Your finances look relatively stable at the moment." : risk === "Moderate" ? "You have some breathing room, but reducing optional expenses could help." : "Your projected funds may not last. Consider cutting non-essential spending."}</p>
          </section>
        </div>
        <div className="col-12 col-lg-6">
          <section className="fh-card h-100">
            <div className="fh-card-head d-flex justify-content-between align-items-start">
              <div><h2>Savings Goal Progress</h2><p>Small steps toward a stronger safety net</p></div>
              <span className="fh-head-icon"><PiggyBank size={19} /></span>
            </div>
            <div className="fh-savings-amount">{money(reserved)} <span>/ {money(goal)}</span></div>
            <div className="d-flex align-items-center justify-content-between fh-progress-label"><span>Your goal</span><strong>{Math.round(progress)}%</strong></div>
            <div className="progress fh-progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin="0" aria-valuemax="100">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <div className="fh-savings-tip"><Target size={18} /> {progress >= 100 ? "Amazing! You've reached your savings goal." : `${money(Math.max(0, goal - reserved))} left to reach your savings target.`}</div>
          </section>
        </div>
      </div>

      <section className="fh-card mb-4">
        <div className="fh-card-head d-flex justify-content-between align-items-start">
          <div><h2>Smart Money Insights ✨</h2><p>Suggestions based on your current financial data</p></div>
          <span className="fh-head-icon"><Lightbulb size={19} /></span>
        </div>
        <div className="row g-3">
          {insights.length ? insights.map((item, index) => {
            const tone = item.type === "success" ? "success" : item.type === "warning" ? "warning" : "info";
            const Icon = tone === "success" ? ShieldCheck : tone === "warning" ? AlertTriangle : Info;
            return (
              <div className="col-12 col-lg-6" key={`${item.title}-${index}`}>
                <div className={`fh-insight ${tone} h-100`}>
                  <span className="fh-insight-icon"><Icon size={20} /></span>
                  <div><h3>{item.title}</h3><p className="mb-0">{item.message ?? item.detail ?? "Review your spending to improve your financial wellness."}</p></div>
                </div>
              </div>
            );
          }) : (
            <div className="col-12"><div className="fh-insight info"><Info size={20} /><p className="mb-0">Add transactions to unlock personalized insights.</p></div></div>
          )}
        </div>
      </section>
      <p className="fh-disclaimer">Spendora's health score and projections are educational estimates, not a credit score or professional financial advice. Calculations use your selected challenge day.</p>
    </motion.div>
  );
}
