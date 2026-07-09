import { useEffect, useState } from "react";
import {
  Camera,
  Heart,
  Mail,
  PackageCheck,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Profile() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    profileImage: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        profileImage: user.profileImage || "",
      });

      setPreview(user.profileImage || "");
    }
  }, [user]);

  useEffect(() => {
    const loadProfileStats = async () => {
      try {
        const [ordersResponse, wishlistResponse] = await Promise.all([
          api.get("/bookings/my"),
          api.get("/wishlist"),
        ]);

        setOrderCount(ordersResponse.data?.length || 0);
        setWishlistCount(wishlistResponse.data?.length || 0);
      } catch (err) {
        console.log("Could not load profile stats");
      }
    };

    if (user) {
      loadProfileStats();
    }
  }, [user]);

  const uploadImage = async () => {
    if (!imageFile) return form.profileImage || "";

    const formData = new FormData();
    formData.append("image", imageFile);

    const { data } = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data.imageUrl;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const uploadedImageUrl = await uploadImage();

      const { data } = await api.put("/auth/profile", {
        name: form.name,
        phone: form.phone,
        profileImage: uploadedImageUrl,
      });

      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <main className="page-container">
        <section className="empty-state">
          <h2>Please log in first.</h2>
          <p>You need an account to view your profile.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-v2-hero">
        <div>
          <span className="hero-tag">
            <Sparkles size={16} />
            My StitchNow Account
          </span>

          <h1>Profile Settings</h1>

          <p>
            Manage your personal details, saved boutiques, bookings, and account
            preferences from one place.
          </p>
        </div>
      </section>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <section className="profile-v2-layout">
        <aside className="profile-v2-card">
          <div className="profile-v2-avatar">
            {preview ? (
              <img src={preview} alt={form.name} />
            ) : (
              <User size={58} />
            )}
          </div>

          <h2>{user.name}</h2>

          <p className="profile-v2-role">
            {user.role === "boutiqueOwner" ? "Boutique Owner" : "Customer"}
          </p>

          <div className="profile-v2-lines">
            <div>
              <Mail size={17} />
              <span>{user.email}</span>
            </div>

            <div>
              <Phone size={17} />
              <span>{form.phone || "No phone added"}</span>
            </div>

            <div>
              <ShieldCheck size={17} />
              <span>Verified StitchNow account</span>
            </div>
          </div>

          <div className="profile-v2-quick-links">
            <Link to="/orders">
              <PackageCheck size={18} />
              My Orders
            </Link>

            <Link to="/wishlist">
              <Heart size={18} />
              Wishlist
            </Link>
          </div>
        </aside>

        <section className="profile-v2-content">
          <div className="profile-v2-stats">
            <article>
              <PackageCheck size={22} />
              <span>Total Orders</span>
              <strong>{orderCount}</strong>
            </article>

            <article>
              <Heart size={22} />
              <span>Saved Boutiques</span>
              <strong>{wishlistCount}</strong>
            </article>

            <article>
              <ShieldCheck size={22} />
              <span>Account Type</span>
              <strong>
                {user.role === "boutiqueOwner" ? "Owner" : "Customer"}
              </strong>
            </article>
          </div>

          <form className="profile-v2-form" onSubmit={handleSubmit}>
            <div className="profile-v2-form-heading">
              <div>
                <p className="eyebrow">ACCOUNT DETAILS</p>
                <h2>Edit Profile</h2>
              </div>
            </div>

            <label>
              Profile Photo
              <div className="profile-upload">
                <Camera size={20} />
                <span>Upload new photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </label>

            <label>
              Full Name
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </label>

            <label>
              Phone Number
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                required
              />
            </label>

            <label>
              Email Address
              <input value={user.email} readOnly />
              <small>Email cannot be changed from this page.</small>
            </label>

            <button className="login-btn" disabled={saving}>
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
