import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  MapPin,
  Phone,
  Star,
  Zap,
  Scissors,
} from "lucide-react";
import api from "../services/api";

export default function BoutiqueDetails() {
  const { id } = useParams();

  const [boutique, setBoutique] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const [boutiqueResponse, serviceResponse] = await Promise.all([
          api.get(`/boutiques/${id}`),
          api.get("/services", {
            params: { boutique: id },
          }),
        ]);

        setBoutique(boutiqueResponse.data);
        setServices(serviceResponse.data);
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
        <p className="loading-text">Loading boutique details...</p>
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
    <main className="page-container">
      <Link className="back-link" to="/boutiques">
        <ArrowLeft size={18} />
        Back to Boutiques
      </Link>

      <section className="boutique-details-hero">
        <img
          src={
            boutique.image ||
            "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80"
          }
          alt={boutique.name}
        />

        <div className="boutique-details-content">
          <div className="details-title-row">
            <div>
              <p className="eyebrow">TAILORING PARTNER</p>
              <h1>{boutique.name}</h1>
            </div>

            {boutique.isVerified && (
              <span className="verified-badge">Verified Boutique</span>
            )}
          </div>

          <p className="details-location">
            <MapPin size={18} />
            {boutique.address}, {boutique.city}
          </p>

          <p className="details-description">{boutique.description}</p>

          <div className="details-meta">
            <span>
              <Star size={17} fill="currentColor" />
              {boutique.rating > 0 ? boutique.rating.toFixed(1) : "New"}
            </span>

            <span>
              <Phone size={17} />
              {boutique.phone}
            </span>

            {boutique.isAvailableForUrgentOrders && (
              <span className="urgent-tag">
                <Zap size={17} />
                Urgent orders accepted
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="services-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">AVAILABLE SERVICES</p>
            <h2>Choose a tailoring service</h2>
          </div>

          <Scissors size={26} />
        </div>

        {services.length === 0 ? (
          <section className="empty-state">
            <h3>No services added yet</h3>
            <p>This boutique has not listed its stitching services yet.</p>
          </section>
        ) : (
          <div className="service-list">
            {services.map((service) => (
              <article className="service-card" key={service._id}>
                <div>
                  <span className="service-category">{service.category}</span>
                  <h3>{service.name}</h3>

                  {service.description && <p>{service.description}</p>}

                  <div className="service-delivery">
                    <Clock3 size={16} />
                    Expected delivery: {service.deliveryDays} day
                    {service.deliveryDays > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="service-action">
                  <p className="service-price">₹{service.price}</p>

                  {service.urgentPrice > 0 && (
                    <p className="urgent-price">
                      Urgent: ₹{service.urgentPrice}
                    </p>
                  )}

                  <Link
                    className="btn"
                    to={`/book/${boutique._id}/${service._id}`}
                  >
                    Book Now
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
