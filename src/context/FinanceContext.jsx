import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { INCOME_SETTINGS_KEY, INCOME_UPDATED_EVENT, readIncomeSettings, calculateIncomeSettings } from '../utils/incomeSettings';

const FinanceContext = createContext(null);
const KEY = 'spendora_finance_v1';
const seed = {
  budget: 10000, currentDay: 10, savings: 1200, savingsGoal: 3000,
  transactions: [
    { id: '1', title: 'Monthly Allowance', category: 'Income', type: 'income', amount: 10000, date: '2026-10-01' },
    { id: '2', title: 'Coffee & Snacks', category: 'Food', type: 'expense', amount: 180, date: '2026-10-02' },
    { id: '3', title: 'Online Shopping', category: 'Shopping', type: 'expense', amount: 799, date: '2026-10-03' },
    { id: '4', title: 'Lunch with Friends', category: 'Food', type: 'expense', amount: 250, date: '2026-10-04' },
    { id: '5', title: 'Metro & Bus', category: 'Transport', type: 'expense', amount: 120, date: '2026-10-05' },
    { id: '6', title: 'Groceries', category: 'Food', type: 'expense', amount: 1451, date: '2026-10-06' }
  ],
  goals: [{ id: 'emergency', name: 'Emergency Fund', target: 3000, saved: 1200, emoji: '🛟' }],
  subscriptions: []
};
const positive = value => Number.isFinite(Number(value)) && Number(value) > 0;
const round = n => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const makeId = () => crypto.randomUUID();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    const old = JSON.parse(raw);
    if (!old || !Array.isArray(old.transactions)) return seed;
    const goals = Array.isArray(old.goals) ? old.goals : [{ ...seed.goals[0], target: Number(old.savingsGoal ?? 3000), saved: Number(old.savings ?? 1200) }];
    return { ...seed, ...old, goals, subscriptions: Array.isArray(old.subscriptions) ? old.subscriptions : [] };
  } catch { return seed; }
}

export function FinanceProvider({ children }) {
  const [data, setData] = useState(load);
  const [incomeSettings, setIncomeSettings] = useState(readIncomeSettings);
  useEffect(() => {
    const refresh = () => setIncomeSettings(readIncomeSettings());
    const onStorage = (event) => { if (event.key === INCOME_SETTINGS_KEY) refresh(); };
    window.addEventListener(INCOME_UPDATED_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(INCOME_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  const planning = useMemo(() => calculateIncomeSettings(incomeSettings), [incomeSettings]);
  // Virtual balancing entry: never rewrites or deletes user's recorded transactions.
  // It is a budget simulation, NOT proof of received money.
  const transactions = useMemo(() => {
    const recordedIncome = data.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const difference = round(planning.totalIncome - recordedIncome);
    if (difference === 0) return data.transactions;
    return [{
      id: '__spendora_income_sync__',
      title: difference > 0 ? 'Income Plan Adjustment' : 'Income Plan Reduction',
      category: 'Income', type: 'income', amount: difference,
      date: new Date().toLocaleDateString('en-CA'),
      isIncomeAdjustment: true
    }, ...data.transactions];
  }, [data.transactions, planning.totalIncome]);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { console.warn('Could not save Spendora data', e); } }, [data]);

  const summary = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((a,t) => a + Number(t.amount || 0), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((a,t) => a + Number(t.amount || 0), 0);
    const balance = round(income - expenses);
    const savings = round(data.goals.reduce((a,g) => a + Number(g.saved || 0), 0));
    const savingsGoal = round(data.goals.reduce((a,g) => a + Number(g.target || 0), 0));
    const daysLeft = Math.max(0, 30 - Number(data.currentDay));
    const availableAfterSavings = round(balance - savings);
    const dailyAllowance = daysLeft ? Math.max(0, availableAfterSavings / daysLeft) : 0;
    const monthlySubscriptions = round(data.subscriptions.filter(s => s.active).reduce((a,s) => a + Number(s.amount || 0), 0));
    return { income: round(income), expenses: round(expenses), balance, savings, savingsGoal, daysLeft, availableAfterSavings, dailyAllowance, monthlySubscriptions };
  }, [data, transactions]);

  const addTransaction = t => {
    if (!positive(t.amount) || !['income','expense'].includes(t.type)) return false;
    setData(d => ({ ...d, transactions: [{ ...t, id: makeId(), amount: round(t.amount) }, ...d.transactions] }));
    return true;
  };
  const deleteTransaction = id => { if (id === '__spendora_income_sync__') return; setData(d => ({ ...d, transactions: d.transactions.filter(t => t.id !== id) })); };
  const updateCurrentDay = day => setData(d => ({ ...d, currentDay: Math.max(1, Math.min(30, Number(day) || 1)) }));
  const addGoal = (name, target, emoji = '🎯') => {
    if (!name.trim() || !positive(target)) return false;
    setData(d => ({ ...d, goals: [...d.goals, { id: makeId(), name: name.trim(), target: round(target), saved: 0, emoji }] }));
    return true;
  };
  const allocateGoal = (id, amount) => {
    const n = Number(amount);
    if (!positive(n)) return false;
    const balance = transactions.reduce((a,t) => a + (t.type === 'income' ? 1 : -1) * Number(t.amount || 0), 0);
    const reserved = data.goals.reduce((a,g) => a + Number(g.saved || 0), 0);
    if (n > balance - reserved + 0.0001) return false;
    setData(d => ({ ...d, goals: d.goals.map(g => g.id === id ? { ...g, saved: round(g.saved + n) } : g) }));
    return true;
  };
  const withdrawGoal = (id, amount) => {
    const n = Number(amount);
    const goal = data.goals.find(g => g.id === id);
    if (!positive(n) || !goal || n > goal.saved) return false;
    setData(d => ({ ...d, goals: d.goals.map(g => g.id === id ? { ...g, saved: round(g.saved - n) } : g) }));
    return true;
  };
  const deleteGoal = id => setData(d => ({ ...d, goals: d.goals.filter(g => g.id !== id) }));
  const addSubscription = s => {
    if (!s.name.trim() || !positive(s.amount) || !/^\d{4}-\d{2}-\d{2}$/.test(s.nextDate)) return false;
    setData(d => ({ ...d, subscriptions: [...d.subscriptions, { ...s, id: makeId(), name: s.name.trim(), amount: round(s.amount), active: true }] }));
    return true;
  };
  const toggleSubscription = id => setData(d => ({ ...d, subscriptions: d.subscriptions.map(s => s.id === id ? { ...s, active: !s.active } : s) }));
  const deleteSubscription = id => setData(d => ({ ...d, subscriptions: d.subscriptions.filter(s => s.id !== id) }));
  return <FinanceContext.Provider value={{ ...data, transactions, ...summary, plannedIncome: planning.totalIncome, savingsTarget: planning.savingsTarget, spendingBudget: planning.spendingBudget, recordedIncome: round(data.transactions.filter(t => t.type === 'income').reduce((a,t) => a + Number(t.amount || 0),0)), addTransaction, deleteTransaction, updateCurrentDay, addGoal, allocateGoal, withdrawGoal, deleteGoal, addSubscription, toggleSubscription, deleteSubscription }}>{children}</FinanceContext.Provider>;
}
export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance requires FinanceProvider');
  return context;
}
