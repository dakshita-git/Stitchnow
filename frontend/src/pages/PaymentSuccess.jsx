import { Link } from "react-router-dom";
import { CheckCircle2, Package, Home } from "lucide-react";

export default function PaymentSuccess() {
  return (
    <main className="payment-success-page">
      <div className="payment-success-card">
        <div className="success-icon">
          <CheckCircle2 size={90} />
        </div>

        <h1>Payment Successful!</h1>

        <p>
          Your StitchNow booking has been confirmed successfully. The boutique
          has received your order and will start processing it soon.
        </p>

        <div className="success-features">
          <div>✔ Booking Confirmed</div>
          <div>✔ Payment Received</div>
          <div>✔ Live Order Tracking Enabled</div>
          <div>✔ Chat with Boutique Available</div>
        </div>

        <div className="success-buttons">
          <Link className="primary-btn" to="/orders">
            <Package size={18} />
            View My Orders
          </Link>

          <Link className="secondary-btn" to="/">
            <Home size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
