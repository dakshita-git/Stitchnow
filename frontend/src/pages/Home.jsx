import ImageWithFallback from "../components/ImageWithFallback";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  Clock3,
  MapPin,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  WalletCards,
} from "lucide-react";

const services = [
  {
    title: "Bridal Blouse Stitching",
    desc: "Designer stitching by experienced boutiques.",
  },
  {
    title: "Lehenga Stitching",
    desc: "Premium wedding tailoring with perfect fitting.",
  },
  {
    title: "Alterations",
    desc: "Same-day alteration available near you.",
  },
  {
    title: "Saree Fall & Pico",
    desc: "Quick finishing for every occasion.",
  },
  {
    title: "Men's Tailoring",
    desc: "Formal suits, shirts and custom fitting.",
  },
  {
    title: "Embroidery",
    desc: "Hand & machine embroidery specialists.",
  },
  {
    title: "Kids Wear",
    desc: "Comfortable and stylish tailoring for kids.",
  },
  {
    title: "Urgent Wedding Orders",
    desc: "Emergency stitching within 24–48 hours.",
  },
];

const steps = [
  {
    icon: <MapPin size={28} />,
    title: "Find Nearby Boutiques",
    text: "Browse verified boutiques near your location with ratings and pricing.",
  },
  {
    icon: <Upload size={28} />,
    title: "Upload Your Design",
    text: "Share your inspiration image, notes and measurements before booking.",
  },
  {
    icon: <CalendarCheck size={28} />,
    title: "Book & Track",
    text: "Pay securely, chat with the boutique and track every stitching stage.",
  },
];

const stats = [
  {
    number: "500+",
    label: "Verified Boutiques",
  },
  {
    number: "10K+",
    label: "Happy Customers",
  },
  {
    number: "25K+",
    label: "Orders Completed",
  },
  {
    number: "4.9★",
    label: "Average Rating",
  },
];

export default function Home() {
  return (
    <main className="v2-home">
      {/* HERO */}

      <section className="v2-hero">
        <div className="v2-left">
          <span className="hero-tag">
            <Sparkles size={16} />
            India's Smart Tailoring Marketplace
          </span>

          <h1>
            Book Trusted Tailors &<span> Designer Boutiques</span>
            <br />
            Near You.
          </h1>

          <p>
            StitchNow helps you discover verified boutiques, upload your design,
            compare services, make secure payments, chat directly with boutique
            owners, and track your order in real time.
          </p>

          <div className="hero-buttons">
            <Link to="/boutiques" className="primary-btn">
              Find Boutiques
              <ArrowRight size={18} />
            </Link>

            <Link to="/register" className="secondary-btn">
              Join as Boutique
            </Link>
          </div>

          <div className="hero-features">
            <span>
              <ShieldCheck size={18} />
              Verified Boutiques
            </span>

            <span>
              <Clock3 size={18} />
              Urgent Orders
            </span>

            <span>
              <WalletCards size={18} />
              Secure Payments
            </span>
          </div>
        </div>

        {/* UPDATED HERO IMAGE */}

        <div className="v2-right">
          <div className="hero-image-card">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80"
              alt="Professional Boutique Tailoring"
            />

            <div className="hero-card-content">
              <div className="rating-row">
                <Star fill="currentColor" size={18} />
                <span>4.9 Rating</span>
              </div>

              <h3>Designer Boutique Services</h3>

              <p>Express Delivery Available</p>

              <strong>Starting ₹499</strong>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}

      <section className="stats-section">
        {stats.map((item) => (
          <div key={item.label} className="stat-card">
            <h2>{item.number}</h2>
            <p>{item.label}</p>
          </div>
        ))}
      </section>

      {/* SERVICES */}

      <section className="section">
        <div className="section-heading">
          <span>Popular Services</span>

          <h2>
            Everything you need for
            <br />
            perfect stitching.
          </h2>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <div className="service-card" key={service.title}>
              <div className="service-icon">
                <Scissors size={28} />
              </div>

              <h3>{service.title}</h3>

              <p>{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section className="section">
        <div className="section-heading">
          <span>How It Works</span>

          <h2>
            Book tailoring services
            <br />
            in just three simple steps.
          </h2>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <div className="step-card" key={step.title}>
              <div className="step-number">0{index + 1}</div>

              <div className="step-icon">{step.icon}</div>

              <h3>{step.title}</h3>

              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}

      <section className="cta-section">
        <h2>Ready to Stitch Your Dream Outfit?</h2>

        <p>
          Discover trusted boutiques near you and book your tailoring service
          today.
        </p>

        <Link to="/boutiques" className="primary-btn big-btn">
          Explore Boutiques
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
