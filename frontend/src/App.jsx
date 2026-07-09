import { Outlet, Link, useNavigate } from "react-router-dom";
import { Scissors, Bell, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, logout, notifications, toast, setToast } = useAuth();

  const nav = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isBoutiqueOwner =
    user?.role === "boutiqueOwner" || user?.role === "boutique";

  const unreadCount =
    notifications?.filter((notification) => !notification.isRead).length || 0;

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    nav("/");
    closeMobileMenu();
  };

  return (
    <>
      <nav className="v2-nav">
        <Link className="v2-brand" to="/" onClick={closeMobileMenu}>
          <span className="v2-brand-icon">
            <Scissors size={22} />
          </span>

          <span>StitchNow</span>
        </Link>

        <button
          type="button"
          className="v2-menu-btn"
          onClick={() => setMobileOpen((previous) => !previous)}
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`v2-nav-links ${mobileOpen ? "open" : ""}`}>
          <Link to="/boutiques" onClick={closeMobileMenu}>
            Boutiques
          </Link>

          {user && (
            <>
              <Link to="/orders" onClick={closeMobileMenu}>
                My Orders
              </Link>

              <Link to="/wishlist" onClick={closeMobileMenu}>
                Wishlist
              </Link>
            </>
          )}

          {isBoutiqueOwner && (
            <>
              <Link to="/dashboard" onClick={closeMobileMenu}>
                Dashboard
              </Link>

              <Link
                className="v2-outline-btn"
                to="/add-boutique"
                onClick={closeMobileMenu}
              >
                Add Boutique
              </Link>
            </>
          )}

          {user && (
            <Link to="/profile" onClick={closeMobileMenu}>
              Profile
            </Link>
          )}

          {user && (
            <div className="notification-wrapper">
              <button
                type="button"
                className="notification-btn"
                onClick={() => setShowNotifications((previous) => !previous)}
                aria-label="Notifications"
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
            <button
              type="button"
              className="v2-ghost-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" onClick={closeMobileMenu}>
                Login
              </Link>

              <Link
                className="v2-primary-btn"
                to="/register"
                onClick={closeMobileMenu}
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      </nav>

      {toast && (
        <div className="toast-notification">
          <button
            type="button"
            className="toast-close"
            onClick={() => setToast(null)}
          >
            ×
          </button>

          <strong>🔔 {toast.title}</strong>

          <p>{toast.message}</p>
        </div>
      )}

      <Outlet />

      <footer className="v2-footer">
        © {new Date().getFullYear()} StitchNow — Smart Tailoring Booking
        Platform
      </footer>
    </>
  );
}
