import { useMemo, useState } from "react";

import { motion, AnimatePresence } from "motion/react";

import {

  Plus, Search, Trash2, X, Wallet,

  ArrowDownLeft, ArrowUpRight,

  Receipt, Filter, Sparkles

} from "lucide-react";



import { useFinance } from "../context/FinanceContext";

import { formatMoney } from "../utils/finance";



const categories = [

  "Food",

  "Shopping",

  "Transport",

  "Bills",

  "Entertainment",

  "Health",

  "Education",

  "Others"

];



const today = () =>

  new Date().toLocaleDateString("en-CA");



const emptyForm = {

  title: "",

  amount: "",

  type: "expense",

  category: "Food",

  date: today()

};



export default function Transactions() {

  const {

    transactions,

    plannedIncome,

    savingsTarget,

    spendingBudget,

    income,

    expenses,

    balance,

    addTransaction,

    deleteTransaction

  } = useFinance();



  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("all");

  const [error, setError] = useState("");



  const filtered = useMemo(() => {

    return transactions

      .filter(t => {

        const matchesSearch =

          t.title.toLowerCase().includes(

            search.toLowerCase()

          ) ||

          t.category.toLowerCase().includes(

            search.toLowerCase()

          );



        const matchesType =

          filter === "all" || t.type === filter;



        return matchesSearch && matchesType;

      })

      .sort((a, b) =>

        b.date.localeCompare(a.date)

      );

  }, [transactions, search, filter]);



  const updateForm = (key, value) => {

    setForm(previous => ({

      ...previous,

      [key]: value

    }));

  };



  const submit = (e) => {

    e.preventDefault();



    const amount = Number(form.amount);



    if (

      !form.title.trim() ||

      !Number.isFinite(amount) ||

      amount <= 0 ||

      !form.date

    ) {

      setError("Please enter valid transaction details.");

      return;

    }



    addTransaction({

      ...form,

      title: form.title.trim(),

      amount,

      category:

        form.type === "income"

          ? "Income"

          : form.category

    });



    setModalOpen(false);

    setForm({ ...emptyForm, date: today() });

    setError("");

  };



  const openModal = () => {

    setForm({ ...emptyForm, date: today() });

    setError("");

    setModalOpen(true);

  };



  return (

    <motion.div

      className="tx-page"

      initial={{ opacity: 0, y: 15 }}

      animate={{ opacity: 1, y: 0 }}

    >

      <div className="tx-hero">

        <div>

          <span className="tx-eyebrow">

            <Sparkles size={15}/>

            YOUR MONEY MOVEMENTS

          </span>

          <h1>Transactions 💸</h1>

          <p>

            Every rupee has a story.

            Track your income and expenses.

          </p>

        </div>



        <button

          className="tx-add-button"

          onClick={openModal}

        >

          <Plus size={18}/>

          Add Transaction

        </button>

      </div>



      <div className="tx-stats">

        <div className="tx-stat">

          <div className="tx-stat-icon green">

            <ArrowDownLeft size={22}/>

          </div>

          <span>Total Income</span>

          <h2>{formatMoney(income)}</h2>

        </div>



        <div className="tx-stat">

          <div className="tx-stat-icon peach">

            <ArrowUpRight size={22}/>

          </div>

          <span>Total Expenses</span>

          <h2>{formatMoney(expenses)}</h2>

        </div>



        <div className="tx-stat">

          <div className="tx-stat-icon purple">

            <Wallet size={22}/>

          </div>

          <span>Current Balance</span>

          <h2>{formatMoney(balance)}</h2>

        </div>

      </div>



      <section
        className="panel"
        style={{ marginBottom: 22, padding: "18px 22px", borderRadius: 18 }}
        aria-label="Monthly planning overview"
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={17} color="#8667eb" /> Monthly Plan vs Actual
            </strong>
            <small style={{ color: "#8b83a2" }}>
              Income Setup adjusts the displayed income and balance for planning. The adjustment is not a received payment.
            </small>
          </div>
          <div style={{ display: "flex", gap: 25, flexWrap: "wrap" }}>
            <div><small>Planned Income</small><div><strong>{formatMoney(plannedIncome)}</strong></div></div>
            <div><small>Income Including Plan Adjustment</small><div><strong>{formatMoney(income)}</strong></div></div>
            <div><small>Savings Target</small><div><strong>{formatMoney(savingsTarget)}</strong></div></div>
            <div><small>Planned Spending</small><div><strong>{formatMoney(spendingBudget)}</strong></div></div>
          </div>
        </div>
      </section>
      <section className="panel tx-panel">

        <div className="tx-panel-top">

          <div>

            <h3>Transaction History</h3>

            <p>

              {filtered.length} transactions found

            </p>

          </div>



          <div className="tx-filters">

            <div className="tx-search">

              <Search size={17}/>

              <input

                type="search"

                placeholder="Search transactions..."

                value={search}

                onChange={e => setSearch(e.target.value)}

              />

            </div>



            <div className="tx-select-wrap">

              <Filter size={16}/>

              <select

                value={filter}

                onChange={e => setFilter(e.target.value)}

              >

                <option value="all">All</option>

                <option value="income">Income</option>

                <option value="expense">Expenses</option>

              </select>

            </div>

          </div>

        </div>



        <div className="tx-table-wrap">

          <table className="tx-table">

            <thead>

              <tr>

                <th>Transaction</th>

                <th>Category</th>

                <th>Date</th>

                <th>Amount</th>

                <th>Action</th>

              </tr>

            </thead>



            <tbody>

              {filtered.map(t => (

                <tr key={t.id}>

                  <td>

                    <div className="tx-name">

                      <span className={

                        `tx-row-icon ${t.type}`

                      }>

                        {t.type === "income"

                          ? <ArrowDownLeft size={19}/>

                          : <Receipt size={19}/>}

                      </span>



                      <div>

                        <strong>{t.title}</strong>

                        <small>

                          {t.type === "income"

                            ? t.isIncomeAdjustment ? "Planning adjustment (not received)" : "Money received"

                            : "Money spent"}

                        </small>

                      </div>

                    </div>

                  </td>



                  <td>

                    <span className="tx-category">

                      {t.category}

                    </span>

                  </td>



                  <td>{t.date}</td>



                  <td>

                    <strong className={

                      t.type === "income"

                        ? "tx-positive"

                        : "tx-negative"

                    }>

                      {t.type === "income" ? (t.amount < 0 ? "-" : "+") : "-"}

                      {formatMoney(Math.abs(t.amount))}

                    </strong>

                  </td>



                  <td>

                    <button

                      className="tx-delete"

                      title={t.isIncomeAdjustment ? "Edit income in Income Setup" : "Delete transaction"}

                      onClick={() => {

                        if (

                          window.confirm(

                            "Delete this transaction?"

                          )

                        ) {

                          deleteTransaction(t.id);

                        }

                      }}

                    >

                      <Trash2 size={17}/>

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>



          {filtered.length === 0 && (

            <div className="tx-empty">

              <Receipt size={32}/>

              <h3>No transactions found</h3>

              <p>Try another filter or add a transaction.</p>

            </div>

          )}

        </div>

      </section>



      <AnimatePresence>

        {modalOpen && (

          <motion.div

            className="tx-modal-backdrop"

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            onMouseDown={e => {

              if (e.target === e.currentTarget) {

                setModalOpen(false);

              }

            }}

          >

            <motion.div

              className="tx-modal"

              role="dialog"

              aria-modal="true"

              aria-label="Add transaction"

              initial={{ opacity: 0, scale: .95, y: 20 }}

              animate={{ opacity: 1, scale: 1, y: 0 }}

              exit={{ opacity: 0, scale: .95, y: 20 }}

            >

              <div className="tx-modal-header">

                <div>

                  <h2>Add Transaction</h2>

                  <p>Record your latest money move.</p>

                </div>



                <button

                  onClick={() => setModalOpen(false)}

                  aria-label="Close"

                >

                  <X size={20}/>

                </button>

              </div>



              <form onSubmit={submit}>

                <label>Transaction Type</label>



                <div className="tx-type-switch">

                  <button

                    type="button"

                    className={

                      form.type === "expense"

                        ? "selected" : ""

                    }

                    onClick={() =>

                      updateForm("type", "expense")

                    }

                  >

                    Expense

                  </button>



                  <button

                    type="button"

                    className={

                      form.type === "income"

                        ? "selected" : ""

                    }

                    onClick={() =>

                      updateForm("type", "income")

                    }

                  >

                    Income

                  </button>

                </div>



                <label>Title</label>

                <input

                  required

                  maxLength={80}

                  placeholder="e.g. Lunch with friends"

                  value={form.title}

                  onChange={e =>

                    updateForm("title", e.target.value)

                  }

                />



                <label>Amount (₹)</label>

                <input

                  required

                  type="number"

                  min="0.01"

                  step="0.01"

                  placeholder="Enter amount"

                  value={form.amount}

                  onChange={e =>

                    updateForm("amount", e.target.value)

                  }

                />



                {form.type === "expense" && (

                  <>

                    <label>Category</label>

                    <select

                      value={form.category}

                      onChange={e =>

                        updateForm("category", e.target.value)

                      }

                    >

                      {categories.map(category => (

                        <option key={category}>

                          {category}

                        </option>

                      ))}

                    </select>

                  </>

                )}



                <label>Date</label>

                <input

                  type="date"

                  required

                  value={form.date}

                  onChange={e =>

                    updateForm("date", e.target.value)

                  }

                />



                {error && (

                  <p className="tx-error">{error}</p>

                )}



                <button

                  type="submit"

                  className="tx-submit"

                >

                  <Plus size={17}/>

                  Save Transaction

                </button>

              </form>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </motion.div>

  );

}
