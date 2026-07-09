import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Star, ArrowRight, Trash2 } from "lucide-react";
import api from "../services/api";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWishlist = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/wishlist");

      setWishlist(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeWishlist = async (id) => {
    try {
      const { data } = await api.post(`/wishlist/${id}`);
      setWishlist(data.wishlist);
    } catch (err) {
      alert("Could not update wishlist.");
    }
  };

  if (loading) {
    return (
      <main className="page-container">
        <p className="loading-text">Loading wishlist...</p>
      </main>
    );
  }

  return (
    <main className="wishlist-page">
      <section className="wishlist-hero">
        <Heart size={34} fill="currentColor" />

        <div>
          <h1>My Wishlist</h1>
          <p>Save your favourite boutiques for later.</p>
        </div>
      </section>

      {error && <p className="error-message">{error}</p>}

      {wishlist.length === 0 ? (
        <section className="empty-state">
          <Heart size={60} />

          <h2>Your wishlist is empty</h2>

          <p>Browse boutiques and tap the ❤️ icon to save them.</p>

          <Link className="btn" to="/boutiques">
            Explore Boutiques
          </Link>
        </section>
      ) : (
        <section className="marketplace-grid">
          {wishlist.map((boutique) => (
            <article className="marketplace-card" key={boutique._id}>
              <div className="marketplace-image-wrap">
                <img
                  src={
                    boutique.image ||
                    "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80"
                  }
                  alt={boutique.name}
                />

                <button
                  className="wishlist-btn saved"
                  onClick={() => removeWishlist(boutique._id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="marketplace-card-body">
                <div className="marketplace-card-top">
                  <span className="marketplace-rating">
                    <Star size={15} fill="currentColor" />

                    {boutique.rating > 0 ? boutique.rating.toFixed(1) : "New"}
                  </span>
                </div>

                <h3>{boutique.name}</h3>

                <p className="marketplace-location">
                  <MapPin size={16} />

                  {boutique.city}
                </p>

                <p className="marketplace-desc">{boutique.description}</p>

                <div className="marketplace-footer">
                  <span>Starts from ₹299</span>

                  <Link to={`/boutiques/${boutique._id}`}>
                    View Details
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
