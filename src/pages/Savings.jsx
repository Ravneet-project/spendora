import { useState } from 'react';
import { motion } from 'motion/react';
import { PiggyBank, Plus, ArrowDownLeft, ArrowUpRight, Trash2, Sparkles, ShieldCheck } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatMoney } from '../utils/finance';

export default function Savings() {
  const { goals, savings, savingsGoal, availableAfterSavings, addGoal, allocateGoal, withdrawGoal, deleteGoal } = useFinance();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [amounts, setAmounts] = useState({});
  const [message, setMessage] = useState('');
  const create = e => {
    e.preventDefault();
    if (addGoal(name, target)) { setName(''); setTarget(''); setMessage('Goal created!'); }
    else setMessage('Enter a goal name and a target above ₹0.');
  };
  const change = (id, action) => {
    const amount = Number(amounts[id]);
    const ok = action === 'save' ? allocateGoal(id, amount) : withdrawGoal(id, amount);
    setMessage(ok ? (action === 'save' ? 'Money reserved for your goal.' : 'Money released to available balance.') : 'Invalid amount or insufficient available funds.');
    if (ok) setAmounts(a => ({ ...a, [id]: '' }));
  };
  return <motion.div className="sp5-page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
    <header className="sp5-hero"><div><span className="sp5-eyebrow"><Sparkles size={15}/> BUILD YOUR SAFETY NET</span><h1>Savings Goals 🎯</h1><p>Small savings today, big possibilities tomorrow.</p></div><PiggyBank size={60} className="sp5-hero-art"/></header>
    <div className="sp5-metrics"><article><span>Total Saved</span><strong>{formatMoney(savings)}</strong><small>Reserved, not spent</small></article><article><span>Combined Target</span><strong>{formatMoney(savingsGoal)}</strong><small>Across {goals.length} goals</small></article><article><span>Free to Allocate</span><strong>{formatMoney(availableAfterSavings)}</strong><small>Balance after savings</small></article></div>
    <div className="sp5-layout"><section className="panel"><div className="sp5-heading"><h3>Your goals</h3><span>{goals.length} active goals</span></div><div className="sp5-goals">{goals.length === 0 && <p>No goals yet. Create one to get started.</p>}{goals.map(g => { const pct = g.target > 0 ? Math.min(100, g.saved / g.target * 100) : 0; return <article className="sp5-goal" key={g.id}><div className="sp5-goal-title"><div className="sp5-goal-emoji">{g.emoji}</div><div><h4>{g.name}</h4><small>{Math.round(pct)}% complete</small></div><button title="Delete goal and release reserved money" aria-label={`Delete ${g.name}`} onClick={() => { if (window.confirm('Delete this goal? Its reserved amount will become available again.')) deleteGoal(g.id); }}><Trash2 size={17}/></button></div><div className="sp5-goal-money"><strong>{formatMoney(g.saved)}</strong><span> / {formatMoney(g.target)}</span></div><div className="sp5-track"><div style={{ width: `${pct}%` }}/></div><div className="sp5-actions"><input aria-label={`Amount for ${g.name}`} type="number" min="0.01" step="0.01" placeholder="Amount ₹" value={amounts[g.id] ?? ''} onChange={e => setAmounts(a => ({ ...a, [g.id]: e.target.value }))}/><button onClick={() => change(g.id, 'save')}><ArrowDownLeft size={15}/> Save</button><button className="sp5-secondary" onClick={() => change(g.id, 'withdraw')}><ArrowUpRight size={15}/> Withdraw</button></div></article>; })}</div></section>
    <aside className="panel sp5-side"><h3><Plus size={19}/> Create a new goal</h3><p>Give your next big plan a name and target.</p><form onSubmit={create}><label>Goal name<input required maxLength={60} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. New laptop"/></label><label>Target amount (₹)<input required type="number" min="1" step="0.01" value={target} onChange={e => setTarget(e.target.value)} placeholder="5000"/></label><button type="submit" className="sp5-primary"><Plus size={17}/> Add Savings Goal</button></form><div className="sp5-tip"><ShieldCheck size={20}/><span>Allocations reserve money from your spendable balance. They do not create expense transactions.</span></div></aside></div>{message && <p className="sp5-message" role="status">{message}</p>}
  </motion.div>;
}
