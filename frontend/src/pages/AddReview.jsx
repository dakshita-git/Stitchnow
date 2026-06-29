import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import api from "../services/api";

export default function AddReview() {
  const { boutiqueId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const submitReview = async (e) => {
    e.preventDefault();

    try {
      await api.post("/reviews", {
        boutique: boutiqueId,
        rating: Number(rating),
        comment,
      });

      navigate(`/boutiques/${boutiqueId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not add review");
    }
  };

  return (
    <main className="page-container">
      <section className="form-card">
        <h1>Add Review</h1>
        <p>Rate your boutique experience after delivery.</p>

        {error && <p className="error-message">{error}</p>}

        <form className="boutique-form" onSubmit={submitReview}>
          <label>
            Rating
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((num) => (
                <option key={num} value={num}>
                  {num} Star
                </option>
              ))}
            </select>
          </label>

          <label>
            Comment
            <textarea
              rows="5"
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </label>

          <button className="btn">
            <Star size={18} />
            Submit Review
          </button>
        </form>
      </section>
    </main>
  );
}
