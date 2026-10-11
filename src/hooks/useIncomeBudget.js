import { useEffect, useState } from "react";
import { INCOME_SETTINGS_KEY, INCOME_UPDATED_EVENT, calculateIncomeSettings, readIncomeSettings } from "../utils/incomeSettings";
export default function useIncomeBudget() {
  const [settings, setSettings] = useState(readIncomeSettings);
  useEffect(() => {
    const refresh = () => setSettings(readIncomeSettings());
    const onStorage = (event) => { if (event.key === INCOME_SETTINGS_KEY) refresh(); };
    window.addEventListener(INCOME_UPDATED_EVENT, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(INCOME_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return calculateIncomeSettings(settings);
}
