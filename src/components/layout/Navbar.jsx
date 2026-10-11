
import { Bell, Search, CalendarDays } from "lucide-react";
import NotificationBell from "../notifications/NotificationBell";
export default function Navbar() {
  const date = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  });

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h2>Financial Overview <span>✦</span></h2>
        <p>Let's make every rupee count.</p>
      </div>

      <div className="topbar-actions">
        <div className="date-pill">
          <CalendarDays size={17}/>
          <span>{date}</span>
        </div>
        <button className="icon-button" aria-label="Search">
          <Search size={19}/>
        </button>
        <NotificationBell />
        <div className="user-avatar">S</div>
      </div>
    </header>
  );
}
