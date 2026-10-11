
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, ArrowLeftRight, SlidersHorizontal,
  PiggyBank, Repeat2, HeartPulse, Settings,
  Wallet, Sparkles, ChevronRight
} from "lucide-react";

const menu = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { name: "What-If Simulator", path: "/simulator", icon: SlidersHorizontal },
  { name: "Savings Goals", path: "/savings", icon: PiggyBank },
  { name: "Subscriptions", path: "/subscriptions", icon: Repeat2 },
  { name: "Financial Health", path: "/health", icon: HeartPulse },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><Wallet size={23}/></div>
        <div>
          <h2>Spendora<span>.</span></h2>
          <small>Money made simple</small>
        </div>
      </div>

      <p className="menu-label">WORKSPACE</p>

      <nav className="side-nav">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({isActive}) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19}/>
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="upgrade-card">
          <Sparkles size={22}/>
          <h4>Your money journey</h4>
          <p>Small moves today. Big wins tomorrow.</p>
          <NavLink to="/simulator">
            Start exploring <ChevronRight size={15}/>
          </NavLink>
        </div>
        <div className="nav-item settings-link">
          <Settings size={19}/>
          <span>Settings</span>
        </div>
      </div>
    </aside>
  );
}
