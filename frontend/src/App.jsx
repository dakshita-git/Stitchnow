import { Outlet, Link, useNavigate } from "react-router-dom";
import { Scissors } from "lucide-react";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const isBoutiqueOwner =
    user?.role === "boutiqueOwner" || user?.role === "boutique";

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

      <Outlet />

      <footer>© StitchNow — Smart tailoring booking platform</footer>
    </>
  );
}
