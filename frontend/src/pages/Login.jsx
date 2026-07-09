import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Scissors, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/boutiques");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-left">
        <div className="auth-badge">
          <Sparkles size={16} />
          Welcome Back
        </div>

        <h1>
          Continue your
          <span> StitchNow </span>
          journey.
        </h1>

        <p>
          Login to manage bookings, chat with boutiques, track tailoring
          progress, review completed orders, and enjoy a seamless tailoring
          experience.
        </p>

        <div className="auth-features">
          <div>
            <Scissors size={18} />
            Verified Boutiques
          </div>

          <div>
            <Lock size={18} />
            Secure Payments
          </div>

          <div>
            <Mail size={18} />
            Live Notifications
          </div>
        </div>
      </section>

      <section className="auth-card">
        <h2>Login</h2>

        <p>Sign in to your StitchNow account.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="input-group">
            <Mail size={18} />

            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <Lock size={18} />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button className="login-btn" disabled={loading}>
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?
          <Link to="/register">Register Now</Link>
        </div>
      </section>
    </main>
  );
}
