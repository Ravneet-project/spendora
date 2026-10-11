
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  AlertTriangle,
  Info,
  ShieldCheck,
  X
} from "lucide-react";

import { useFinance } from "../../context/FinanceContext";
import { getBudgetAlerts } from "../../utils/alerts";

const STORAGE_KEY = "spendora_notification_state_v1";

function readSavedState() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );

    return {
      read: Array.isArray(saved.read) ? saved.read : [],
      cleared: Array.isArray(saved.cleared)
        ? saved.cleared
        : []
    };
  } catch {
    return { read: [], cleared: [] };
  }
}

export default function NotificationBell() {
  const finance = useFinance();
  const wrapperRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [state, setState] = useState(readSavedState);

  const alerts = useMemo(
    () => getBudgetAlerts(finance),
    [finance]
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  }, [state]);

  useEffect(() => {
    const closeOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const closeEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        closeOutside
      );
      document.removeEventListener(
        "keydown",
        closeEscape
      );
    };
  }, []);

  const notifications = alerts.filter(
    alert => !state.cleared.includes(alert.id)
  );

  const unread = notifications.filter(
    alert => !state.read.includes(alert.id)
  );

  const markRead = (id) => {
    setState(previous => ({
      ...previous,
      read: [...new Set([...previous.read, id])]
    }));
  };

  const markAllRead = () => {
    setState(previous => ({
      ...previous,
      read: [
        ...new Set([
          ...previous.read,
          ...notifications.map(item => item.id)
        ])
      ]
    }));
  };

  const clearRead = () => {
    const readIds = notifications
      .filter(item => state.read.includes(item.id))
      .map(item => item.id);

    setState(previous => ({
      ...previous,
      cleared: [
        ...new Set([...previous.cleared, ...readIds])
      ]
    }));
  };

  return (
    <div className="sp-notification" ref={wrapperRef}>
      <button
        type="button"
        className="sp-notification-trigger"
        onClick={() => setOpen(value => !value)}
        aria-label={`${unread.length} unread notifications`}
        aria-expanded={open}
      >
        <Bell size={19} />

        {unread.length > 0 && (
          <span className="sp-notification-badge">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="sp-notification-dropdown">
          <div className="sp-notification-header">
            <div>
              <h3>Notifications</h3>
              <p>
                {unread.length} unread alerts
              </p>
            </div>

            <button
              type="button"
              className="sp-notification-close"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>

          <div className="sp-notification-actions">
            <button
              type="button"
              onClick={markAllRead}
              disabled={unread.length === 0}
            >
              <CheckCheck size={15} />
              Mark all read
            </button>

            <button
              type="button"
              onClick={clearRead}
              disabled={
                !notifications.some(
                  item => state.read.includes(item.id)
                )
              }
            >
              <Trash2 size={15} />
              Clear read
            </button>
          </div>

          <div className="sp-notification-list">
            {notifications.length === 0 ? (
              <div className="sp-notification-empty">
                <ShieldCheck size={30} />
                <h4>You're all caught up!</h4>
                <p>No active notifications right now.</p>
              </div>
            ) : (
              notifications.map(item => {
                const isRead = state.read.includes(item.id);

                const Icon =
                  item.type === "danger" ||
                  item.type === "warning"
                    ? AlertTriangle
                    : Info;

                return (
                  <div
                    key={item.id}
                    className={
                      "sp-notification-item " +
                      (isRead ? "is-read" : "is-unread")
                    }
                  >
                    <div
                      className={
                        "sp-notification-item-icon " +
                        item.type
                      }
                    >
                      <Icon size={18} />
                    </div>

                    <div className="sp-notification-item-body">
                      <strong>{item.title}</strong>
                      <p>{item.message}</p>

                      {!isRead && (
                        <button
                          type="button"
                          onClick={() => markRead(item.id)}
                        >
                          <Check size={13} />
                          Mark as read
                        </button>
                      )}
                    </div>

                    {!isRead && (
                      <span className="sp-notification-dot" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="sp-notification-footer">
            Spendora Smart Money Alerts 💜
          </div>
        </div>
      )}
    </div>
  );
}
