import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  Heart,
  MapPin,
  Phone,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import api from "../services/api";
import Skeleton from "../components/Skeleton";
import ImageWithFallback from "../components/ImageWithFallback";

export default function BoutiqueDetails() {
  const { id } = useParams();

  const [boutique, setBoutique] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const [boutiqueResponse, serviceResponse, reviewResponse] =
          await Promise.all([
            api.get(`/boutiques/${id}`),
            api.get("/services", { params: { boutique: id } }),
            api.get(`/reviews/${id}`),
          ]);

        setBoutique(boutiqueResponse.data);
        setServices(serviceResponse.data);
        setReviews(reviewResponse.data);
        setSelectedService(serviceResponse.data[0] || null);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load boutique details. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <main className="page-container">
        <section className="details-v2-hero">
          <Skeleton width="45%" height="420px" radius="24px" />

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <Skeleton width="120px" height="20px" />

            <Skeleton width="70%" height="42px" />

            <Skeleton width="45%" height="18px" />

            <Skeleton width="100%" height="18px" />
            <Skeleton width="90%" height="18px" />
            <Skeleton width="80%" height="18px" />

            <div
              style={{
                display: "flex",
                gap: "15px",
                marginTop: "20px",
              }}
            >
              <Skeleton width="140px" height="40px" />
              <Skeleton width="160px" height="40px" />
            </div>
          </div>
        </section>

        <section className="details-v2-services" style={{ marginTop: "40px" }}>
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="details-v2-service"
              style={{
                pointerEvents: "none",
              }}
            >
              <div style={{ flex: 1 }}>
                <Skeleton width="120px" height="18px" />

                <div style={{ height: "12px" }} />

                <Skeleton width="220px" height="28px" />

                <div style={{ height: "16px" }} />

                <Skeleton width="100%" height="16px" />
                <Skeleton width="90%" height="16px" />

                <div style={{ height: "18px" }} />

                <Skeleton width="170px" height="16px" />
              </div>

              <div>
                <Skeleton width="80px" height="30px" />

                <div style={{ height: "20px" }} />

                <Skeleton width="100px" height="20px" />
              </div>
            </div>
          ))}
        </section>
      </main>
    );
  }
  if (error || !boutique) {
    return (
      <main className="page-container">
        <section className="empty-state">
          <h2>Could not open this boutique.</h2>
          <p>{error || "This boutique may no longer exist."}</p>
          <Link className="btn" to="/boutiques">
            Back to Boutiques
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="details-v2-page">
      <Link className="details-v2-back" to="/boutiques">
        <ArrowLeft size={18} />
        Back to Boutiques
      </Link>

      <section className="details-v2-hero">
        <div className="details-v2-cover">
          <ImageWithFallback src={boutique.image} alt={boutique.name} />

          <button className="details-v2-heart" type="button">
            <Heart size={20} />
          </button>

          {boutique.isAvailableForUrgentOrders && (
            <span className="details-v2-urgent">
              <Zap size={15} />
              Urgent Orders Available
            </span>
          )}
        </div>

        <div className="details-v2-info">
          <span className="hero-tag">
            <Sparkles size={16} />
            Tailoring Partner
          </span>

          <h1>{boutique.name}</h1>

          <p className="details-v2-location">
            <MapPin size={18} />
            {boutique.address}, {boutique.city}
          </p>

          <p className="details-v2-desc">{boutique.description}</p>

          <div className="details-v2-meta">
            <span>
              <Star size={17} fill="currentColor" />
              {boutique.rating > 0 ? boutique.rating.toFixed(1) : "New"} Rating
            </span>

            <span>
              <Phone size={17} />
              {boutique.phone}
            </span>

            {boutique.isVerified && (
              <span>
                <BadgeCheck size={17} />
                Verified Boutique
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="details-v2-layout">
        <div className="details-v2-main">
          <section className="details-v2-card">
            <div className="details-v2-section-title">
              <div>
                <p>ABOUT BOUTIQUE</p>
                <h2>Why choose this boutique?</h2>
              </div>
              <ShieldCheck size={26} />
            </div>

            <div className="details-v2-benefits">
              <span>Verified tailoring partner</span>
              <span>Design image support</span>
              <span>Secure Razorpay payments</span>
              <span>Live order tracking</span>
            </div>
          </section>

          <section className="details-v2-card">
            <div className="details-v2-section-title">
              <div>
                <p>AVAILABLE SERVICES</p>
                <h2>Choose a tailoring service</h2>
              </div>
              <Scissors size={26} />
            </div>

            {services.length === 0 ? (
              <div className="premium-empty-state">
                <Scissors size={48} />

                <h3>No Services Available</h3>

                <p>
                  This boutique hasn't added any tailoring services yet. Please
                  check back later.
                </p>
              </div>
            ) : (
              <div className="details-v2-services">
                {services.map((service) => (
                  <article
                    className={`details-v2-service ${
                      selectedService?._id === service._id ? "active" : ""
                    }`}
                    key={service._id}
                    onClick={() => setSelectedService(service)}
                  >
                    <div>
                      <span>{service.category}</span>
                      <h3>{service.name}</h3>
                      {service.description && <p>{service.description}</p>}

                      <small>
                        <Clock3 size={15} />
                        Delivery in {service.deliveryDays} day
                        {service.deliveryDays > 1 ? "s" : ""}
                      </small>
                    </div>

                    <div className="details-v2-price">
                      <strong>₹{service.price}</strong>

                      {service.urgentPrice > 0 && (
                        <em>Urgent ₹{service.urgentPrice}</em>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="details-v2-card">
            <div className="details-v2-section-title">
              <div>
                <p>CUSTOMER REVIEWS</p>
                <h2>What customers say</h2>
              </div>
              <Star size={26} />
            </div>
            {reviews.length === 0 ? (
              <div className="premium-empty-state">
                <Star size={48} />

                <h3>No Reviews Yet</h3>

                <p>
                  This boutique hasn't received any customer reviews yet. Be the
                  first to share your experience after booking.
                </p>
              </div>
            ) : (
              <div className="details-v2-reviews">
                {reviews.slice(0, 4).map((review) => (
                  <article className="details-v2-review" key={review._id}>
                    <div>
                      <strong>{review.customer?.name || "Customer"}</strong>
                      <span>
                        <Star size={14} fill="currentColor" />
                        {review.rating}
                      </span>
                    </div>

                    <p>{review.comment || "Great experience!"}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="details-v2-sticky">
          <div className="sticky-book-card">
            <p>STARTING FROM</p>
            <h2>₹{selectedService?.price || services[0]?.price || 299}</h2>

            <span>
              {selectedService?.name || "Select a service to continue"}
            </span>

            {selectedService ? (
              <Link
                className="primary-btn sticky-book-btn"
                to={`/book/${boutique._id}/${selectedService._id}`}
              >
                Book Now
              </Link>
            ) : (
              <button className="primary-btn sticky-book-btn" disabled>
                No Service Available
              </button>
            )}

            <small>
              Secure payment, design upload, chat, and live order tracking
              included.
            </small>
          </div>
        </aside>
      </section>
    </main>
  );
}
