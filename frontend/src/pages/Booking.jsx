import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Image,
  IndianRupee,
  MapPin,
  Ruler,
  Zap,
} from "lucide-react";
import api from "../services/api";

const timeSlots = [
  "10 AM - 12 PM",
  "12 PM - 2 PM",
  "2 PM - 4 PM",
  "4 PM - 6 PM",
];

export default function Booking() {
  const { boutiqueId, serviceId } = useParams();
  const navigate = useNavigate();

  const [boutique, setBoutique] = useState(null);
  const [service, setService] = useState(null);

  const [form, setForm] = useState({
    bookingDate: "",
    timeSlot: "",
    notes: "",
    isUrgent: false,
    measurements: {
      bust: "",
      waist: "",
      hip: "",
      shoulder: "",
      length: "",
    },
  });

  const [designImageFile, setDesignImageFile] = useState(null);
  const [designPreview, setDesignPreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookingDetails = async () => {
      try {
        setLoadingDetails(true);
        setError("");

        const [boutiqueResponse, serviceResponse] = await Promise.all([
          api.get(`/boutiques/${boutiqueId}`),
          api.get("/services", {
            params: { boutique: boutiqueId },
          }),
        ]);

        const selectedService = serviceResponse.data.find(
          (item) => item._id === serviceId,
        );

        if (!selectedService) {
          setError("The selected service could not be found.");
          return;
        }

        setBoutique(boutiqueResponse.data);
        setService(selectedService);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load booking details. Please try again.",
        );
      } finally {
        setLoadingDetails(false);
      }
    };

    loadBookingDetails();
  }, [boutiqueId, serviceId]);

  useEffect(() => {
    return () => {
      if (designPreview) URL.revokeObjectURL(designPreview);
    };
  }, [designPreview]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMeasurementChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      measurements: {
        ...previous.measurements,
        [name]: value,
      },
    }));
  };

  const handleDesignImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setError("");

    if (designPreview) URL.revokeObjectURL(designPreview);

    setDesignImageFile(file);
    setDesignPreview(URL.createObjectURL(file));
  };

  const removeDesignImage = () => {
    if (designPreview) URL.revokeObjectURL(designPreview);

    setDesignImageFile(null);
    setDesignPreview("");
  };

  const uploadDesignImage = async () => {
    if (!designImageFile) return "";

    const formData = new FormData();
    formData.append("image", designImageFile);

    const { data } = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data.imageUrl;
  };

  const getFinalAmount = () => {
    if (!service) return 0;

    if (form.isUrgent && service.urgentPrice > 0) {
      return service.urgentPrice;
    }

    return service.price;
  };

  const submitBooking = async (event) => {
    event.preventDefault();

    if (!form.bookingDate || !form.timeSlot) {
      setError("Please choose both a booking date and time slot.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      let uploadedImageUrl = "";

      if (designImageFile) {
        setUploadingImage(true);
        uploadedImageUrl = await uploadDesignImage();
        setUploadingImage(false);
      }

      await api.post("/bookings", {
        boutique: boutiqueId,
        service: serviceId,
        bookingDate: form.bookingDate,
        timeSlot: form.timeSlot,
        notes: form.notes,
        designImage: uploadedImageUrl,
        measurements: form.measurements,
        amount: getFinalAmount(),
      });

      navigate("/orders");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not create your booking. Please try again.",
      );
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  if (loadingDetails) {
    return (
      <main className="page-container">
        <p className="loading-text">Loading booking details...</p>
      </main>
    );
  }

  if (error && !service) {
    return (
      <main className="page-container">
        <section className="empty-state">
          <h2>Unable to start this booking.</h2>
          <p>{error}</p>

          <Link className="btn" to="/boutiques">
            Back to Boutiques
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-container">
      <Link className="back-link" to={`/boutiques/${boutiqueId}`}>
        <ArrowLeft size={18} />
        Back to Boutique
      </Link>

      <section className="booking-layout">
        <form className="booking-form-card" onSubmit={submitBooking}>
          <p className="eyebrow">COMPLETE YOUR BOOKING</p>
          <h1>Book Tailoring Service</h1>
          <p className="booking-subtitle">
            Choose your preferred date, time, order type, design image, and
            measurements.
          </p>

          {error && <p className="error-message">{error}</p>}

          <div className="booking-form-grid">
            <label>
              Booking Date
              <div className="input-with-icon">
                <CalendarDays size={18} />
                <input
                  type="date"
                  name="bookingDate"
                  value={form.bookingDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>

            <label>
              Preferred Time Slot
              <div className="input-with-icon">
                <Clock3 size={18} />
                <select
                  name="timeSlot"
                  value={form.timeSlot}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a time slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <label className="urgent-order-row">
            <input
              type="checkbox"
              name="isUrgent"
              checked={form.isUrgent}
              disabled={!service?.urgentPrice}
              onChange={handleChange}
            />

            <span>
              <Zap size={18} />
              <span>
                <strong>Urgent Order</strong>
                <small>
                  {service?.urgentPrice > 0
                    ? `Fast service available for ₹${service.urgentPrice}`
                    : "Urgent service is not available for this item"}
                </small>
              </span>
            </span>
          </label>

          <label>
            Design Reference Image <span className="optional">(optional)</span>
            <div className="input-with-icon">
              <Image size={18} />
              <input
                type="file"
                accept="image/*"
                onChange={handleDesignImage}
              />
            </div>
            <small className="upload-help-text">
              Upload a dress/design reference image. Maximum file size: 5 MB.
            </small>
          </label>

          {designPreview && (
            <div className="image-preview-box">
              <img src={designPreview} alt="Design preview" />

              <button
                type="button"
                className="remove-image-btn"
                onClick={removeDesignImage}
              >
                Remove Image
              </button>
            </div>
          )}

          <label>
            Design Notes <span className="optional">(optional)</span>
            <textarea
              name="notes"
              value={form.notes}
              placeholder="Example: I need a deep-neck blouse with elbow sleeves and padded cups."
              rows="4"
              onChange={handleChange}
            />
          </label>

          <section className="measurements-section">
            <div className="measurements-heading">
              <Ruler size={20} />
              <div>
                <h3>Measurements</h3>
                <p>Add measurements in inches. You can leave fields empty.</p>
              </div>
            </div>

            <div className="measurement-grid">
              {Object.keys(form.measurements).map((key) => (
                <label key={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <input
                    type="text"
                    name={key}
                    value={form.measurements[key]}
                    placeholder="In inches"
                    onChange={handleMeasurementChange}
                  />
                </label>
              ))}
            </div>
          </section>

          <button
            className="booking-submit-btn"
            disabled={submitting || uploadingImage}
          >
            <IndianRupee size={18} />
            {uploadingImage
              ? "Uploading Image..."
              : submitting
                ? "Creating Booking..."
                : `Confirm Booking • ₹${getFinalAmount()}`}
          </button>
        </form>

        <aside className="booking-summary-card">
          <p className="eyebrow">ORDER SUMMARY</p>

          <img
            src={
              boutique?.image ||
              "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80"
            }
            alt={boutique?.name}
          />

          <h2>{service?.name}</h2>
          <p className="booking-category">{service?.category}</p>

          <div className="summary-boutique">
            <MapPin size={18} />
            <span>
              <strong>{boutique?.name}</strong>
              <small>{boutique?.city}</small>
            </span>
          </div>

          <div className="summary-line">
            <span>Standard Price</span>
            <strong>₹{service?.price}</strong>
          </div>

          {service?.urgentPrice > 0 && (
            <div className="summary-line">
              <span>Urgent Price</span>
              <strong>₹{service?.urgentPrice}</strong>
            </div>
          )}

          <div className="summary-line">
            <span>Expected delivery</span>
            <strong>
              {service?.deliveryDays} day
              {service?.deliveryDays > 1 ? "s" : ""}
            </strong>
          </div>

          <div className="summary-total">
            <span>Total Amount</span>
            <strong>₹{getFinalAmount()}</strong>
          </div>

          <p className="payment-note">
            Payment status will remain pending until payment integration is
            added.
          </p>
        </aside>
      </section>
    </main>
  );
}
