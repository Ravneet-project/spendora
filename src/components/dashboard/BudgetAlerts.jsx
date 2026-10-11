
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  Info,
  ShieldCheck,
  X
} from "lucide-react";

import { useFinance } from "../../context/FinanceContext";
import { getBudgetAlerts } from "../../utils/alerts";

export default function BudgetAlerts() {
  const finance = useFinance();

  const alerts = useMemo(
    () => getBudgetAlerts(finance),
    [finance]
  );

  const [dismissed, setDismissed] = useState([]);

  const visibleAlerts = alerts.filter(
    alert => !dismissed.includes(alert.id)
  );

  return (
    <section className="sp-alert-section">
      <div className="sp-alert-heading">
        <div>
          <h3>
            <BellRing size={19} />
            Smart Budget Alerts
          </h3>
          <p>
            Stay informed about your money decisions.
          </p>
        </div>

        <span className="sp-alert-count">
          {visibleAlerts.length} alerts
        </span>
      </div>

      {visibleAlerts.length === 0 ? (
        <div className="sp-alert-empty">
          <ShieldCheck size={21} />
          <span>
            No active budget warnings right now.
          </span>
        </div>
      ) : (
        <div className="sp-alert-list">
          {visibleAlerts.map(alert => {
            const Icon =
              alert.type === "danger" ||
              alert.type === "warning"
                ? AlertTriangle
                : Info;

            return (
              <div
                key={alert.id}
                className={`sp-alert sp-alert-${alert.type}`}
              >
                <div className="sp-alert-icon">
                  <Icon size={20} />
                </div>

                <div className="sp-alert-content">
                  <strong>{alert.title}</strong>
                  <p>{alert.message}</p>
                </div>

                <button
                  type="button"
                  className="sp-alert-close"
                  aria-label={`Dismiss ${alert.title}`}
                  onClick={() =>
                    setDismissed(previous => [
                      ...previous,
                      alert.id
                    ])
                  }
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
