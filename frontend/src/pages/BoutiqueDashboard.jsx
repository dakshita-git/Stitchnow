import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const bookingStatuses = [
  "Order Placed",
  "Accepted",
  "Design Confirmed",
  "Cutting",
  "Stitching",
  "Trial Ready",
  "Alteration",
  "Ready",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export default function BoutiqueDashboard() {
  const { user } = useAuth();

  const [boutique, setBoutique] = useState({
    name: "",
    city: "",
    address: "",
    description: "",
    phone: "",
    image: "",
    isAvailableForUrgentOrders: true,
  });

  const [service, setService] = useState({
    boutique: "",
    name: "",
    category: "",
    price: "",
    urgentPrice: "",
    deliveryDays: 3,
    description: "",
  });

  const [myBoutiques, setMyBoutiques] = useState([]);
  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState("");
  const [bookings, setBookings] = useState([]);

  const [boutiqueImageFile, setBoutiqueImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loadingBoutiques, setLoadingBoutiques] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [creatingBoutique, setCreatingBoutique] = useState(false);
  const [creatingService, setCreatingService] = useState(false);
  const [updatingBookingId, setUpdatingBookingId] = useState("");

  const isBoutiqueOwner =
    user?.role === "boutiqueOwner" || user?.role === "boutique";

  const loadMyBoutiques = async () => {
    try {
      setLoadingBoutiques(true);

      const { data } = await api.get("/boutiques/owner/my-boutiques");
      setMyBoutiques(data);

      if (data.length > 0) {
        setSelectedBoutiqueId((currentSelected) => {
          return currentSelected || data[0]._id;
        });

        setService((previous) => ({
          ...previous,
          boutique: previous.boutique || data[0]._id,
        }));
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load your boutiques. Please refresh the page.",
      );
    } finally {
      setLoadingBoutiques(false);
    }
  };

  const loadBookings = async (boutiqueId) => {
    if (!boutiqueId) {
      setBookings([]);
      return;
    }

    try {
      setLoadingBookings(true);

      const { data } = await api.get(`/bookings/boutique/${boutiqueId}`);
      setBookings(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load customer bookings.",
      );
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (isBoutiqueOwner) {
      loadMyBoutiques();
    }
  }, []);

  useEffect(() => {
    if (selectedBoutiqueId) {
      setService((previous) => ({
        ...previous,
        boutique: selectedBoutiqueId,
      }));

      loadBookings(selectedBoutiqueId);
    }
  }, [selectedBoutiqueId]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleBoutiqueChange = (event) => {
    const { name, value, type, checked } = event.target;

    setBoutique((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleServiceChange = (event) => {
    const { name, value } = event.target;

    setService((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleBoutiqueImageChange = (event) => {
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

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setBoutiqueImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeBoutiqueImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setBoutiqueImageFile(null);
    setImagePreview("");
  };

  const uploadBoutiqueImage = async () => {
    if (!boutiqueImageFile) return "";

    const formData = new FormData();
    formData.append("image", boutiqueImageFile);

    const { data } = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data.imageUrl;
  };

  const saveBoutique = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setCreatingBoutique(true);

    try {
      let uploadedImageUrl = boutique.image || "";

      if (boutiqueImageFile) {
        setUploadingImage(true);
        uploadedImageUrl = await uploadBoutiqueImage();
        setUploadingImage(false);
      }

      const { data } = await api.post("/boutiques", {
        ...boutique,
        image: uploadedImageUrl,
      });

      const createdBoutique = data.boutique;

      setMyBoutiques((previous) => [createdBoutique, ...previous]);
      setSelectedBoutiqueId(createdBoutique._id);

      setService((previous) => ({
        ...previous,
        boutique: createdBoutique._id,
      }));

      setMessage(
        `"${createdBoutique.name}" was created successfully. You can now add services and manage bookings.`,
      );

      setBoutique({
        name: "",
        city: "",
        address: "",
        description: "",
        phone: "",
        image: "",
        isAvailableForUrgentOrders: true,
      });

      removeBoutiqueImage();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not create boutique. Please try again.",
      );
    } finally {
      setCreatingBoutique(false);
      setUploadingImage(false);
    }
  };

  const saveService = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!service.boutique) {
      setError("Create or select a boutique before adding a service.");
      return;
    }

    setCreatingService(true);

    try {
      const { data } = await api.post("/services", {
        ...service,
        boutique: selectedBoutiqueId,
        price: Number(service.price),
        urgentPrice: Number(service.urgentPrice || 0),
        deliveryDays: Number(service.deliveryDays),
      });

      setMessage(
        `"${data.service?.name || service.name}" was added successfully.`,
      );

      setService((previous) => ({
        ...previous,
        boutique: selectedBoutiqueId,
        name: "",
        category: "",
        price: "",
        urgentPrice: "",
        deliveryDays: 3,
        description: "",
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not add service. Please try again.",
      );
    } finally {
      setCreatingService(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      setUpdatingBookingId(bookingId);
      setError("");
      setMessage("");

      const { data } = await api.put(`/bookings/${bookingId}/status`, {
        status,
      });

      setBookings((previous) =>
        previous.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: data.booking.status }
            : booking,
        ),
      );

      setMessage(`Order status updated to "${status}".`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update order status. Please try again.",
      );
    } finally {
      setUpdatingBookingId("");
    }
  };

  if (!user) {
    return (
      <main className="page-container">
        <section className="empty-state">
          <h2>Please log in first.</h2>
          <p>You must be logged in to manage a boutique.</p>
        </section>
      </main>
    );
  }

  if (!isBoutiqueOwner) {
    return (
      <main className="page-container">
        <section className="empty-state">
          <h2>This dashboard is only for boutique owners.</h2>
          <p>
            Register using the Boutique Owner role to list your tailoring
            business and manage customer orders.
          </p>
        </section>
      </main>
    );
  }

  const selectedBoutique = myBoutiques.find(
    (item) => item._id === selectedBoutiqueId,
  );
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  const pendingOrders = bookings.filter(
    (b) => b.status !== "Delivered" && b.status !== "Cancelled",
  ).length;

  const completedOrders = bookings.filter(
    (b) => b.status === "Delivered",
  ).length;

  const chartData = [
    {
      name: "Revenue",
      value: totalRevenue,
    },
    {
      name: "Orders",
      value: bookings.length,
    },
    {
      name: "Completed",
      value: completedOrders,
    },
  ];

  const pieData = [
    {
      name: "Pending",
      value: pendingOrders,
    },
    {
      name: "Completed",
      value: completedOrders,
    },
  ];

  return (
    <main className="page-container">
      <section className="dashboard-heading">
        <p className="eyebrow">BUSINESS CONTROL CENTER</p>
        <h1>Boutique Owner Dashboard</h1>
        <p>
          Add your boutique, list services, upload boutique photos, and manage
          customer orders from one place.
        </p>
      </section>
      <section className="analytics-grid">
        <div className="analytics-card">
          <h4>Total Revenue</h4>
          <h2>₹{totalRevenue}</h2>
        </div>

        <div className="analytics-card">
          <h4>Total Orders</h4>
          <h2>{bookings.length}</h2>
        </div>

        <div className="analytics-card">
          <h4>Pending Orders</h4>
          <h2>{pendingOrders}</h2>
        </div>

        <div className="analytics-card">
          <h4>Completed Orders</h4>
          <h2>{completedOrders}</h2>
        </div>
      </section>

      <section className="charts-grid">
        <div className="chart-card">
          <h3>Business Overview</h3>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Order Status</h3>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={90} label>
                <Cell fill="#7c3aed" />
                <Cell fill="#22c55e" />
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <section className="owner-summary-grid">
        <article className="owner-summary-card">
          <span>Total Boutiques</span>
          <strong>{myBoutiques.length}</strong>
        </article>

        <article className="owner-summary-card">
          <span>Incoming Orders</span>
          <strong>{bookings.length}</strong>
        </article>

        <article className="owner-summary-card">
          <span>Active Orders</span>
          <strong>
            {
              bookings.filter(
                (booking) =>
                  booking.status !== "Delivered" &&
                  booking.status !== "Cancelled",
              ).length
            }
          </strong>
        </article>
      </section>

      <section className="dashboard-select-section">
        <label>
          Select Boutique to Manage
          <select
            value={selectedBoutiqueId}
            onChange={(event) => setSelectedBoutiqueId(event.target.value)}
            disabled={loadingBoutiques || myBoutiques.length === 0}
          >
            {myBoutiques.length === 0 ? (
              <option value="">Create your first boutique below</option>
            ) : (
              myBoutiques.map((item) => (
                <option value={item._id} key={item._id}>
                  {item.name} — {item.city}
                </option>
              ))
            )}
          </select>
        </label>

        {selectedBoutique && (
          <div className="selected-boutique-info">
            <strong>{selectedBoutique.name}</strong>
            <span>{selectedBoutique.city}</span>
          </div>
        )}
      </section>

      <section className="dash">
        <form onSubmit={saveBoutique} className="card dashboard-card">
          <h2>Create Boutique</h2>

          <label>
            Boutique Name
            <input
              name="name"
              value={boutique.name}
              placeholder="Example: Dakshita Bridal Boutique"
              onChange={handleBoutiqueChange}
              required
            />
          </label>

          <label>
            City
            <input
              name="city"
              value={boutique.city}
              placeholder="Example: Ghaziabad"
              onChange={handleBoutiqueChange}
              required
            />
          </label>

          <label>
            Full Address
            <textarea
              name="address"
              value={boutique.address}
              placeholder="Street, locality, landmark..."
              onChange={handleBoutiqueChange}
              required
            />
          </label>

          <label>
            Phone Number
            <input
              name="phone"
              value={boutique.phone}
              placeholder="10-digit mobile number"
              onChange={handleBoutiqueChange}
              required
            />
          </label>

          <label>
            Boutique Description
            <textarea
              name="description"
              value={boutique.description}
              placeholder="Bridal wear, blouse stitching, lehenga fitting, embroidery..."
              onChange={handleBoutiqueChange}
              required
            />
          </label>

          <label>
            Boutique Image <span className="optional">(optional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleBoutiqueImageChange}
            />
            <small className="upload-help-text">
              Upload a boutique photo. Only images up to 5 MB are allowed.
            </small>
          </label>

          {imagePreview && (
            <div className="image-preview-box">
              <img src={imagePreview} alt="Boutique preview" />

              <button
                type="button"
                className="remove-image-btn"
                onClick={removeBoutiqueImage}
              >
                Remove Image
              </button>
            </div>
          )}

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="isAvailableForUrgentOrders"
              checked={boutique.isAvailableForUrgentOrders}
              onChange={handleBoutiqueChange}
            />
            Accept urgent stitching orders
          </label>

          <button className="btn" disabled={creatingBoutique || uploadingImage}>
            {uploadingImage
              ? "Uploading Image..."
              : creatingBoutique
                ? "Saving Boutique..."
                : "Save Boutique"}
          </button>
        </form>

        <form onSubmit={saveService} className="card dashboard-card">
          <h2>Add Service</h2>

          <label>
            Selected Boutique
            <input
              value={
                selectedBoutique
                  ? `${selectedBoutique.name} (${selectedBoutique.city})`
                  : ""
              }
              placeholder="Create/select a boutique first"
              readOnly
            />
          </label>

          <label>
            Service Name
            <input
              name="name"
              value={service.name}
              placeholder="Example: Bridal Blouse Stitching"
              onChange={handleServiceChange}
              required
            />
          </label>

          <label>
            Category
            <input
              name="category"
              value={service.category}
              placeholder="Example: Blouse, Lehenga, Alteration"
              onChange={handleServiceChange}
              required
            />
          </label>

          <label>
            Standard Price
            <input
              type="number"
              min="0"
              name="price"
              value={service.price}
              placeholder="Example: 1200"
              onChange={handleServiceChange}
              required
            />
          </label>

          <label>
            Urgent Order Price
            <input
              type="number"
              min="0"
              name="urgentPrice"
              value={service.urgentPrice}
              placeholder="Example: 1800"
              onChange={handleServiceChange}
            />
          </label>

          <label>
            Delivery Days
            <input
              type="number"
              min="1"
              name="deliveryDays"
              value={service.deliveryDays}
              onChange={handleServiceChange}
              required
            />
          </label>

          <label>
            Service Description
            <textarea
              name="description"
              value={service.description}
              placeholder="Example: Includes padded blouse stitching, fitting support, and one trial."
              onChange={handleServiceChange}
            />
          </label>

          <button
            className="btn"
            disabled={creatingService || !selectedBoutiqueId}
          >
            {creatingService ? "Adding Service..." : "Add Service"}
          </button>
        </form>
      </section>

      <section className="incoming-orders-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">CUSTOMER REQUESTS</p>
            <h2>Incoming Bookings</h2>
          </div>
        </div>

        {!selectedBoutiqueId ? (
          <section className="empty-state">
            <h3>Create a boutique first</h3>
            <p>
              Once your boutique is created, customer bookings will appear here.
            </p>
          </section>
        ) : loadingBookings ? (
          <p className="loading-text">Loading incoming bookings...</p>
        ) : bookings.length === 0 ? (
          <section className="empty-state">
            <h3>No bookings yet</h3>
            <p>
              Customers will appear here after they book one of your services.
            </p>
          </section>
        ) : (
          <div className="owner-bookings-list">
            {bookings.map((booking) => (
              <article className="owner-booking-card" key={booking._id}>
                <div className="owner-booking-top">
                  <div>
                    <span className="order-id">
                      Booking #{booking._id.slice(-6).toUpperCase()}
                    </span>

                    <h3>{booking.service?.name || "Tailoring Service"}</h3>

                    <p>
                      Customer: <strong>{booking.customer?.name}</strong>
                    </p>

                    <p>
                      {booking.customer?.phone} • {booking.customer?.email}
                    </p>
                  </div>

                  <span className="status-badge">{booking.status}</span>
                </div>

                <div className="owner-booking-details">
                  <span>
                    <strong>Booking Date:</strong> {booking.bookingDate}
                  </span>

                  <span>
                    <strong>Time Slot:</strong> {booking.timeSlot}
                  </span>

                  <span>
                    <strong>Amount:</strong> ₹{booking.amount || 0}
                  </span>

                  <span>
                    <strong>Payment:</strong> {booking.paymentStatus}
                  </span>
                </div>

                {booking.designImage && (
                  <a
                    className="design-image-link"
                    href={booking.designImage}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View customer design image
                  </a>
                )}

                {booking.notes && (
                  <p className="owner-booking-notes">
                    <strong>Customer Notes:</strong> {booking.notes}
                  </p>
                )}

                {booking.measurements && (
                  <div className="owner-measurements">
                    <strong>Measurements:</strong>
                    <span>Bust: {booking.measurements.bust || "-"}</span>
                    <span>Waist: {booking.measurements.waist || "-"}</span>
                    <span>Hip: {booking.measurements.hip || "-"}</span>
                    <span>
                      Shoulder: {booking.measurements.shoulder || "-"}
                    </span>
                    <span>Length: {booking.measurements.length || "-"}</span>
                  </div>
                )}

                <div className="booking-actions">
                  <Link
                    className="btn secondary-btn"
                    to={`/chat/${booking._id}`}
                  >
                    💬 Chat with Customer
                  </Link>

                  <label className="status-update-control">
                    Update Order Status
                    <select
                      value={booking.status}
                      disabled={updatingBookingId === booking._id}
                      onChange={(event) =>
                        updateBookingStatus(booking._id, event.target.value)
                      }
                    >
                      {bookingStatuses.map((status) => (
                        <option value={status} key={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
