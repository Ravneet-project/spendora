
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import { FinanceProvider } from "./context/FinanceContext";

import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";

import Dashboard from "./pages/Dashboard";
import Simulator from "./pages/Simulator";
import Transactions from "./pages/Transactions";
import Savings from "./pages/Savings";
import Subscriptions from "./pages/Subscriptions";
import FinancialHealth from "./pages/FinancialHealth";

import "./index.css";

export default function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />

          <div className="main-area">
            <Navbar />

            <main className="page-content">
              <Routes>
                <Route
                  path="/"
                  element={<Dashboard />}
                />

                <Route
                  path="/transactions"
                  element={<Transactions />}
                />

                <Route
                  path="/simulator"
                  element={<Simulator />}
                />

                <Route
                  path="/savings"
                  element={<Savings />}
                />

                <Route
                  path="/subscriptions"
                  element={<Subscriptions />}
                />

                <Route
                  path="/health"
                  element={<FinancialHealth />}
                />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </FinanceProvider>
  );
}
