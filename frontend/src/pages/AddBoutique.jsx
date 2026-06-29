import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Store, MapPin, Phone, Image, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function AddBoutique() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    address: "",
    city: "",
    image: "",
    isAvailableForUrgentOrders: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isBoutiqueOwner =
    user?.role === "boutiqueOwner" || user?.role === "boutique";

  // User must be logged in first
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only boutique owners should add a boutique
  if (!isBoutiqueOwner) {
    return (
      <main className="page-container">
        <section className="empty-state">
          <h2>Only boutique owners can add a boutique.</h2>
          <p>
            Please create a Boutique Owner account to list your tailoring
            business on StitchNow.
          </p>
        </section>
      </main>
    );
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await api.post("/boutiques", form);

      setMessage("Boutique added successfully.");

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Could not add boutique. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container">
      <section className="form-card boutique-form-card">
        <div className="page-heading">
          <div className="heading-icon">
            <Store size={28} />
          </div>

          <div>
            <h1>Add Your Boutique</h1>
            <p>
              Create your boutique profile so customers can discover and book
              your tailoring services.
            </p>
          </div>
        </div>

        {message && (
          <p
            className={
              message.includes("successfully")
                ? "success-message"
                : "error-message"
            }
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="boutique-form">
          <div className="form-grid">
            <label>
              Boutique Name
              <div className="input-with-icon">
                <Store size={18} />
                <input
                  type="text"
                  name="name"
                  placeholder="Example: Elegant Stitches Boutique"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>

            <label>
              Phone Number
              <div className="input-with-icon">
                <Phone size={18} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit phone number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>

            <label>
              City
              <div className="input-with-icon">
                <MapPin size={18} />
                <input
                  type="text"
                  name="city"
                  placeholder="Example: Ghaziabad"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>

            <label>
              Boutique Image URL <span className="optional">(optional)</span>
              <div className="input-with-icon">
                <Image size={18} />
                <input
                  type="url"
                  name="image"
                  placeholder="Paste an image URL"
                  value={form.image}
                  onChange={handleChange}
                />
              </div>
            </label>
          </div>

          <label>
            Full Address
            <textarea
              name="address"
              placeholder="House number, street, locality, landmark..."
              value={form.address}
              onChange={handleChange}
              rows="3"
              required
            />
          </label>

          <label>
            About Your Boutique
            <textarea
              name="description"
              placeholder="Tell customers what your boutique specializes in: bridal wear, lehenga stitching, blouse fitting, embroidery, alterations, etc."
              value={form.description}
              onChange={handleChange}
              rows="5"
              required
            />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="isAvailableForUrgentOrders"
              checked={form.isAvailableForUrgentOrders}
              onChange={handleChange}
            />
            <span>
              I accept urgent stitching orders such as same-day or 24-hour
              delivery requests.
            </span>
          </label>

          <button
            className="primary-submit-btn"
            type="submit"
            disabled={loading}
          >
            <Save size={18} />
            {loading ? "Adding Boutique..." : "Add Boutique"}
          </button>
        </form>
      </section>
    </main>
  );
}
