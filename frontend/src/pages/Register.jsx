import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Scissors,
  Sparkles,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const setRole = (role) => {
    setForm((prev) => ({
      ...prev,
      role,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(form);

      if (form.role === "boutiqueOwner") {
        navigate("/dashboard");
      } else {
        navigate("/boutiques");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page register-page">
      <section className="auth-left">
        <div className="auth-badge">
          <Sparkles size={16} />
          Join StitchNow
        </div>

        <h1>
          Create your
          <span> fashion-service </span>
          account.
        </h1>

        <p>
          Join as a customer to book trusted boutiques, or register as a
          boutique owner to manage services, orders, payments, and customer
          chats from one smart dashboard.
        </p>

        <div className="auth-features">
          <div>
            <Scissors size={18} />
            Urgent Stitching
          </div>

          <div>
            <Building2 size={18} />
            Boutique Dashboard
          </div>

          <div>
            <Lock size={18} />
            Secure Razorpay
          </div>
        </div>
      </section>

      <section className="auth-card register-card">
        <h2>Create Account</h2>
        <p>Choose your role and start using StitchNow.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <User size={18} />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <Mail size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <Phone size={18} />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={18} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password, minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              minLength="6"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="role-selector">
            <p>I want to join as</p>

            <div className="role-grid">
              <button
                type="button"
                className={
                  form.role === "customer" ? "role-card active" : "role-card"
                }
                onClick={() => setRole("customer")}
              >
                <User size={22} />
                <strong>Customer</strong>
                <span>Book tailoring services</span>
              </button>

              <button
                type="button"
                className={
                  form.role === "boutiqueOwner"
                    ? "role-card active"
                    : "role-card"
                }
                onClick={() => setRole("boutiqueOwner")}
              >
                <Building2 size={22} />
                <strong>Boutique Owner</strong>
                <span>List and manage services</span>
              </button>
            </div>
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <Link to="/login">Login</Link>
        </div>
      </section>
    </main>
  );
}
