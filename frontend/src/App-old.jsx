import { Outlet, Link, useNavigate } from "react-router-dom";
import { Scissors, Bell } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, logout, notifications, toast, setToast } = useAuth();

  const nav = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const isBoutiqueOwner =
    user?.role === "boutiqueOwner" || user?.role === "boutique";

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const handleLogout = () => {
    logout();
    nav("/");
  };

  return (
    <>
      <nav className="nav">
        <Link className="brand" to="/">
          <Scissors />
          StitchNow
        </Link>

        <div className="nav-links">
          <Link to="/boutiques">Boutiques</Link>

          {user && <Link to="/orders">My Orders</Link>}

          {isBoutiqueOwner && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link className="btn" to="/add-boutique">
                Add Boutique
              </Link>
            </>
          )}

          {user && (
            <div className="notification-wrapper">
              <button
                className="notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={22} />

                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <h3>Notifications</h3>

                  {notifications.length === 0 ? (
                    <p className="empty-notification">No notifications yet.</p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        className="notification-item"
                        key={notification._id || notification.createdAt}
                      >
                        <strong>{notification.title}</strong>
                        <p>{notification.message}</p>

                        <small>
                          {new Date(notification.createdAt).toLocaleString()}
                        </small>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {user ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login">Login</Link>

              <Link className="btn" to="/register">
                Join
              </Link>
            </>
          )}
        </div>
      </nav>

      {toast && (
        <div className="toast-notification">
          <button className="toast-close" onClick={() => setToast(null)}>
            ×
          </button>

          <strong>🔔 {toast.title}</strong>
          <p>{toast.message}</p>
        </div>
      )}

      <Outlet />

      <footer>© StitchNow — Smart tailoring booking platform</footer>
    </>
  );
}
