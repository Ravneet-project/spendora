
import { useState } from "react";
import {
  Sparkles,
  RotateCcw,
  Wallet,
  Banknote,
  Trash2,
  Plus,
  PiggyBank,
  Info,
} from "lucide-react";

import {
  calculateIncomeSettings,
  readIncomeSettings,
  saveIncomeSettings,
  validAmount,
} from "../../utils/incomeSettings";

import "./income-setup.css";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export default function IncomeSetup() {
  const [settings, setSettings] = useState(readIncomeSettings);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const { totalIncome, savingsTarget, spendingBudget } =
    calculateIncomeSettings(settings);

  const persist = (next) => {
    const saved = saveIncomeSettings(next);
    setSettings(saved);
  };

  const updateSource = (id, field, value) => {
    persist({
      ...settings,
      sources: settings.sources.map((source) =>
        source.id === id
          ? {
              ...source,
              [field]:
                field === "amount" ? validAmount(value) : value,
            }
          : source
      ),
    });
  };

  const addSource = (event) => {
    event.preventDefault();

    const name = newName.trim();
    const amount = Number(newAmount);

    if (
      !name ||
      newAmount.trim() === "" ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      return;
    }

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    persist({
      ...settings,
      sources: [
        ...settings.sources,
        {
          id,
          name,
          amount: validAmount(newAmount),
        },
      ],
    });

    setNewName("");
    setNewAmount("");
  };

  const deleteSource = (id) => {
    persist({
      ...settings,
      sources: settings.sources.filter(
        (source) => source.id !== id
      ),
    });
  };

  const resetAll = () => {
    const confirmed = window.confirm(
      "Reset all income sources and savings target to ₹0? Your transactions will not be deleted."
    );

    if (!confirmed) return;

    persist({
      sources: [],
      savingsTarget: 0,
    });

    setNewName("");
    setNewAmount("");
  };

  const updateSavings = (value) => {
    persist({
      ...settings,
      savingsTarget: Math.min(
        totalIncome,
        validAmount(value)
      ),
    });
  };

  return (
    <section
      className="si-card"
      aria-label="Monthly income setup"
    >
      <div className="si-heading">
        <div>
          <span className="si-eyebrow">
            <Sparkles size={15} aria-hidden="true" />
            YOUR MONEY PLAN
          </span>

          <h2>Set your monthly income</h2>

          <p>
            Add income sources and decide how much
            you want to save.
          </p>
        </div>

        <button
          type="button"
          className="si-reset"
          onClick={resetAll}
        >
          <RotateCcw size={16} aria-hidden="true" />
          Reset All Income
        </button>
      </div>

      <div className="si-overview">
        <div className="si-metric si-purple">
          <span>Total Monthly Income</span>
          <strong>{money(totalIncome)}</strong>
        </div>

        <div className="si-metric si-green">
          <span>Savings Target</span>
          <strong>{money(savingsTarget)}</strong>
        </div>

        <div className="si-metric si-peach">
          <span>Spending Budget</span>
          <strong>{money(spendingBudget)}</strong>
        </div>
      </div>

      <div className="si-columns">
        <div className="si-panel">
          <h3>
            <Wallet size={19} aria-hidden="true" />
            Income Sources
          </h3>

          <div className="si-source-list">
            {settings.sources.length === 0 ? (
              <p className="si-empty">
                No income added yet. Add your first
                income source below.
              </p>
            ) : (
              settings.sources.map((source) => (
                <div
                  className="si-source-row"
                  key={source.id}
                >
                  <div className="si-source-icon">
                    <Banknote
                      size={19}
                      aria-hidden="true"
                    />
                  </div>

                  <label className="si-name-field">
                    <span>Source</span>

                    <input
                      aria-label="Income source name"
                      value={source.name}
                      onChange={(event) =>
                        updateSource(
                          source.id,
                          "name",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label className="si-amount-field">
                    <span>Monthly amount</span>

                    <div className="si-currency">
                      <b>₹</b>

                      <input
                        type="number"
                        min="0"
                        step="any"
                        aria-label={`${source.name} amount`}
                        value={source.amount}
                        onChange={(event) =>
                          updateSource(
                            source.id,
                            "amount",
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </label>

                  <button
                    type="button"
                    className="si-delete"
                    aria-label={`Delete ${source.name}`}
                    title="Remove income"
                    onClick={() =>
                      deleteSource(source.id)
                    }
                  >
                    <Trash2
                      size={17}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              ))
            )}
          </div>

          <form
            className="si-add-row"
            onSubmit={addSource}
          >
            <label className="si-name-field">
              <span>New income source</span>

              <input
                value={newName}
                onChange={(event) =>
                  setNewName(event.target.value)
                }
                placeholder="Salary, Freelance, Pocket Money..."
                required
              />
            </label>

            <label className="si-amount-field">
              <span>Amount</span>

              <div className="si-currency">
                <b>₹</b>

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={newAmount}
                  onChange={(event) =>
                    setNewAmount(event.target.value)
                  }
                  placeholder="0"
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              className="si-add-button"
            >
              <Plus size={17} aria-hidden="true" />
              Add
            </button>
          </form>
        </div>

        <div className="si-panel si-savings-panel">
          <h3>
            <PiggyBank
              size={19}
              aria-hidden="true"
            />
            Savings Allocation
          </h3>

          <p className="si-description">
            Choose how much of your income
            to reserve for savings.
          </p>

          <label
            className="si-savings-label"
            htmlFor="si-savings"
          >
            Monthly savings target
          </label>

          <div className="si-currency si-savings-input">
            <b>₹</b>

            <input
              id="si-savings"
              type="number"
              min="0"
              max={totalIncome}
              step="any"
              value={settings.savingsTarget}
              onChange={(event) =>
                updateSavings(event.target.value)
              }
            />
          </div>

          <input
            className="si-slider"
            aria-label="Savings target"
            type="range"
            min="0"
            max={Math.max(totalIncome, 1)}
            step="1"
            value={savingsTarget}
            onChange={(event) =>
              updateSavings(event.target.value)
            }
            disabled={totalIncome === 0}
          />

          <div className="si-savings-metrics">
            <div>
              <span>Save</span>
              <strong>{money(savingsTarget)}</strong>
            </div>

            <div>
              <span>Spend</span>
              <strong>{money(spendingBudget)}</strong>
            </div>
          </div>

          <div className="si-note">
            <Info size={16} aria-hidden="true" />
            Spending budget = total income minus
            savings target.
          </div>
        </div>
      </div>

      <p className="si-disclaimer">
        Planning only. Changing income here does
        not modify your actual transactions or
        account balance.
      </p>
    </section>
  );
}
