export const INCOME_SETTINGS_KEY = "spendora_income_settings_v1";
export const INCOME_UPDATED_EVENT = "spendora:income-updated";
export const defaultIncomeSettings = { sources: [{ id: "initial-salary", name: "Salary / Pocket Money", amount: 10000 }], savingsTarget: 0 };
export function validAmount(value) { const n = Number(value); return Number.isFinite(n) ? Math.max(0, n) : 0; }
export function normalizeIncomeSettings(settings) {
  const sources = Array.isArray(settings?.sources) ? settings.sources.map((s) => ({ id: String(s.id || ""), name: String(s.name || "Income").trim(), amount: validAmount(s.amount) })).filter((s) => s.id && s.name) : defaultIncomeSettings.sources;
  return { sources, savingsTarget: validAmount(settings?.savingsTarget) };
}
export function readIncomeSettings() {
  try { const saved = localStorage.getItem(INCOME_SETTINGS_KEY); return saved ? normalizeIncomeSettings(JSON.parse(saved)) : normalizeIncomeSettings(defaultIncomeSettings); }
  catch { return normalizeIncomeSettings(defaultIncomeSettings); }
}
export function saveIncomeSettings(settings) {
  const normalized = normalizeIncomeSettings(settings);
  localStorage.setItem(INCOME_SETTINGS_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(INCOME_UPDATED_EVENT, { detail: normalized }));
  return normalized;
}
export function calculateIncomeSettings(settings) {
  const totalIncome = (settings?.sources || []).reduce((sum, source) => sum + validAmount(source.amount), 0);
  const savingsTarget = Math.min(totalIncome, validAmount(settings?.savingsTarget));
  return { totalIncome, savingsTarget, spendingBudget: totalIncome - savingsTarget };
}
