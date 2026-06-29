import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, Star, Zap } from "lucide-react";
import api from "../services/api";

export default function Boutiques() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBoutiques = async (searchText = query) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/boutiques", {
        params: { q: searchText },
      });

      setItems(data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Could not load boutiques. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoutiques("");
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadBoutiques();
  };

  return (
    <main className="page-container">
      <section className="listing-hero">
        <p className="eyebrow">FIND YOUR PERFECT FIT</p>
        <h1>Nearby Boutiques & Tailors</h1>
        <p>
          Discover trusted boutiques for bridal wear, alterations, embroidery,
          urgent stitching, and more.
        </p>
      </section>

      <form className="search search-form" onSubmit={handleSearch}>
        <div className="search-input-wrap">
          <Search size={20} />
          <input
            placeholder="Search by boutique name, city, or service..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <button className="btn" type="submit">
          Search
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p className="loading-text">Loading boutiques...</p>
      ) : items.length === 0 ? (
        <section className="empty-state">
          <h2>No boutiques found</h2>
          <p>
            Try another search, or create your first boutique using a Boutique
            Owner account.
          </p>
        </section>
      ) : (
        <section className="boutique-grid">
          {items.map((boutique) => (
            <Link
              className="boutique-card"
              to={`/boutiques/${boutique._id}`}
              key={boutique._id}
            >
              <img
                src={
                  boutique.image ||
                  "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80"
                }
                alt={boutique.name}
              />

              <div className="boutique-card-content">
                <div className="boutique-card-top">
                  <h3>{boutique.name}</h3>

                  {boutique.isVerified && (
                    <span className="verified-badge">Verified</span>
                  )}
                </div>

                <p className="location-text">
                  <MapPin size={16} />
                  {boutique.city}
                </p>

                <p className="description-text">
                  {boutique.description?.length > 110
                    ? `${boutique.description.slice(0, 110)}...`
                    : boutique.description}
                </p>

                <div className="boutique-card-footer">
                  <span className="rating">
                    <Star size={16} fill="currentColor" />
                    {boutique.rating > 0 ? boutique.rating.toFixed(1) : "New"}
                  </span>

                  {boutique.isAvailableForUrgentOrders ? (
                    <span className="urgent-tag">
                      <Zap size={15} />
                      Urgent orders
                    </span>
                  ) : (
                    <span className="normal-tag">Standard delivery</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
