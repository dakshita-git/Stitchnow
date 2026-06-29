import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  CreditCard,
  IndianRupee,
  MapPin,
  PackageCheck,
  Star,
} from "lucide-react";
import api from "../services/api";

const statuses = [
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
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bookings/my");
      setOrders(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load your orders. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (order) => {
    try {
      setError("");
      setMessage("");
      setPayingOrderId(order._id);

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        setError("Razorpay SDK failed to load. Please check your internet.");
        return;
      }

      const { data } = await api.post("/payments/create-order", {
        bookingId: order._id,
      });

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "StitchNow",
        description: order.service?.name || "Tailoring Service",
        order_id: data.orderId,
        handler: async function (response) {
          try {
            await api.post("/payments/verify", {
              bookingId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setMessage("Payment successful. Your order is marked as paid.");
            await loadOrders();
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment completed but verification failed.",
            );
          }
        },
        prefill: {
          name: "StitchNow Customer",
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function () {
        setError("Payment failed or was cancelled. Please try again.");
      });

      paymentObject.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not start payment. Please try again.",
      );
    } finally {
      setPayingOrderId("");
    }
  };

  if (loading) {
    return (
      <main className="page-container">
        <p className="loading-text">Loading your orders...</p>
      </main>
    );
  }

  return (
    <main className="page-container">
      <section className="orders-heading">
        <p className="eyebrow">YOUR STITCHNOW JOURNEY</p>
        <h1>My Orders</h1>
        <p>Track every stitching step from order placement to delivery.</p>
      </section>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      {orders.length === 0 ? (
        <section className="empty-state">
          <PackageCheck size={42} />
          <h2>No orders yet</h2>
          <p>
            Explore boutiques, choose a tailoring service, and create your first
            StitchNow booking.
          </p>
        </section>
      ) : (
        <section className="orders-list">
          {orders.map((order) => {
            const isCancelled = order.status === "Cancelled";
            const isDelivered = order.status === "Delivered";
            const isPaid = order.paymentStatus === "paid";
            const currentStatusIndex = statuses.indexOf(order.status);

            return (
              <article className="customer-order-card" key={order._id}>
                <div className="order-card-header">
                  <div>
                    <span className="order-id">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </span>

                    <h2>{order.service?.name || "Tailoring Service"}</h2>

                    <p className="order-boutique">
                      <MapPin size={16} />
                      {order.boutique?.name} • {order.boutique?.city}
                    </p>
                  </div>

                  <span
                    className={
                      isCancelled
                        ? "status-badge cancelled-status"
                        : "status-badge"
                    }
                  >
                    {order.status}
                  </span>
                </div>

                <div className="order-info-grid">
                  <div>
                    <CalendarDays size={18} />
                    <span>
                      <small>Booking Date</small>
                      <strong>{order.bookingDate || "Not selected"}</strong>
                    </span>
                  </div>

                  <div>
                    <Clock3 size={18} />
                    <span>
                      <small>Time Slot</small>
                      <strong>{order.timeSlot || "Not selected"}</strong>
                    </span>
                  </div>

                  <div>
                    <IndianRupee size={18} />
                    <span>
                      <small>Amount</small>
                      <strong>
                        ₹{order.amount || order.service?.price || 0}
                      </strong>
                    </span>
                  </div>

                  <div>
                    <CheckCircle2 size={18} />
                    <span>
                      <small>Payment</small>
                      <strong
                        className={isPaid ? "paid-payment" : "pending-payment"}
                      >
                        {order.paymentStatus || "pending"}
                      </strong>
                    </span>
                  </div>
                </div>

                {!isPaid && !isCancelled && (
                  <div className="payment-action-box">
                    <div>
                      <h3>Payment Pending</h3>
                      <p>
                        Pay securely using Razorpay Test Mode to confirm this
                        booking.
                      </p>
                    </div>

                    <button
                      className="btn pay-now-btn"
                      onClick={() => handlePayment(order)}
                      disabled={payingOrderId === order._id}
                    >
                      <CreditCard size={17} />
                      {payingOrderId === order._id ? "Opening..." : "Pay Now"}
                    </button>
                  </div>
                )}

                {isPaid && (
                  <div className="payment-success-box">
                    <CheckCircle2 size={18} />
                    Payment successful. This order is paid.
                  </div>
                )}

                {order.notes && (
                  <div className="order-notes">
                    <strong>Notes:</strong> {order.notes}
                  </div>
                )}

                {order.designImage && (
                  <a
                    className="design-image-link"
                    href={order.designImage}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View uploaded design image
                  </a>
                )}

                {isCancelled ? (
                  <p className="cancelled-order-text">
                    This order was cancelled. Contact the boutique for more
                    details.
                  </p>
                ) : (
                  <div className="customer-timeline">
                    {statuses.map((status, index) => {
                      const isDone = index <= currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;

                      return (
                        <div
                          className={`timeline-step ${
                            isDone ? "timeline-done" : ""
                          } ${isCurrent ? "timeline-current" : ""}`}
                          key={status}
                        >
                          <span className="timeline-dot">
                            {isDone ? (
                              <CheckCircle2 size={15} />
                            ) : (
                              <Circle size={15} />
                            )}
                          </span>

                          <span>{status}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isDelivered && order.boutique?._id && (
                  <div className="review-action-box">
                    <div>
                      <h3>How was your experience?</h3>
                      <p>
                        Your review helps other customers choose trusted
                        boutiques.
                      </p>
                    </div>

                    <Link className="btn" to={`/review/${order.boutique._id}`}>
                      <Star size={17} />
                      Add Review
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
