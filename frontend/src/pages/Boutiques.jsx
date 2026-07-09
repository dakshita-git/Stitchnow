import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import api from "../services/api";

const filters = ["All", "Urgent", "Verified", "Top Rated"];

export default function Boutiques() {
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [wishlistLoadingId, setWishlistLoadingId] = useState("");
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

  const loadWishlist = async () => {
    try {
      const { data } = await api.get("/wishlist");
      setWishlist(data || []);
    } catch (error) {
      console.log("Could not load wishlist");
    }
  };

  useEffect(() => {
    loadBoutiques("");
    loadWishlist();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadBoutiques();
  };

  const isInWishlist = (boutiqueId) => {
    return wishlist.some((item) => item._id === boutiqueId);
  };

  const toggleWishlist = async (boutiqueId) => {
    try {
      setWishlistLoadingId(boutiqueId);

      const { data } = await api.post(`/wishlist/${boutiqueId}`);

      setWishlist(data.wishlist || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Please login first to use wishlist.",
      );
    } finally {
      setWishlistLoadingId("");
    }
  };

  const visibleBoutiques = useMemo(() => {
    let list = [...items];

    if (activeFilter === "Urgent") {
      list = list.filter((item) => item.isAvailableForUrgentOrders);
    }

    if (activeFilter === "Verified") {
      list = list.filter((item) => item.isVerified);
    }

    if (activeFilter === "Top Rated") {
      list = list.filter((item) => item.rating >= 4);
    }

    if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    if (sortBy === "latest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [items, activeFilter, sortBy]);

  return (
    <main className="marketplace-page">
      <section className="marketplace-hero">
        <div>
          <span className="hero-tag">
            <Sparkles size={16} />
            Tailoring marketplace
          </span>

          <h1>Find verified boutiques for your perfect outfit.</h1>

          <p>
            Search trusted tailors for bridal wear, alterations, embroidery,
            urgent stitching, and more.
          </p>
        </div>

        <div className="marketplace-mini-card">
          <Star size={20} fill="currentColor" />
          <strong>{items.length}+</strong>
          <span>Boutiques listed</span>
        </div>
      </section>

      <section className="marketplace-toolbar">
        <form className="marketplace-search" onSubmit={handleSearch}>
          <Search size={20} />

          <input
            placeholder="Search by boutique name, city, or service..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <button type="submit">Search</button>
        </form>

        <div className="marketplace-sort">
          <SlidersHorizontal size={18} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="latest">Latest</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </section>

      <div className="filter-chips">
        {filters.map((filter) => (
          <button
            type="button"
            key={filter}
            className={activeFilter === filter ? "active" : ""}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <section className="marketplace-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div className="skeleton-card" key={item}></div>
          ))}
        </section>
      ) : visibleBoutiques.length === 0 ? (
        <section className="empty-state">
          <h2>No boutiques found</h2>
          <p>Try another search or filter.</p>
        </section>
      ) : (
        <section className="marketplace-grid">
          {visibleBoutiques.map((boutique) => {
            const saved = isInWishlist(boutique._id);

            return (
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
                    className={`wishlist-btn ${saved ? "saved" : ""}`}
                    type="button"
                    onClick={() => toggleWishlist(boutique._id)}
                    disabled={wishlistLoadingId === boutique._id}
                  >
                    <Heart size={18} fill={saved ? "currentColor" : "none"} />
                  </button>

                  {boutique.isAvailableForUrgentOrders && (
                    <span className="urgent-floating-badge">
                      <Zap size={14} />
                      Urgent
                    </span>
                  )}
                </div>

                <div className="marketplace-card-body">
                  <div className="marketplace-card-top">
                    <span className="marketplace-rating">
                      <Star size={15} fill="currentColor" />
                      {boutique.rating > 0 ? boutique.rating.toFixed(1) : "New"}
                    </span>

                    {boutique.isVerified && (
                      <span className="marketplace-verified">
                        <BadgeCheck size={15} />
                        Verified
                      </span>
                    )}
                  </div>

                  <h3>{boutique.name}</h3>

                  <p className="marketplace-location">
                    <MapPin size={16} />
                    {boutique.city}
                  </p>

                  <p className="marketplace-desc">
                    {boutique.description?.length > 105
                      ? `${boutique.description.slice(0, 105)}...`
                      : boutique.description}
                  </p>

                  <div className="marketplace-footer">
                    <span>Starts from ₹299</span>

                    <Link to={`/boutiques/${boutique._id}`}>
                      View Details
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
