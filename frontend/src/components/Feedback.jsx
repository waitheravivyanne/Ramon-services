import { useState } from "react";
import axios from "axios";
import "../styles/Feedback.css";

function Feedback() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setStatus("");

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/feedback`,
        form
      );

      setStatus("Thank you! Your feedback has been sent to our admin.");

      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error("Feedback submission failed:", error);
      setStatus("Sorry, your feedback could not be sent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-container">

        <h1>Give Us Feedback</h1>

        <p className="feedback-intro">
          We value your feedback. Tell us about your experience with
          Ramon's Service Marketplace and how we can improve.
        </p>

        <form onSubmit={handleSubmit} className="feedback-form">

          <label htmlFor="name">Name</label>

          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />

          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="message">Your Feedback</label>

          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us about your experience..."
            rows="6"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Feedback"}
          </button>

        </form>

        {status && (
          <p className="feedback-status">
            {status}
          </p>
        )}

      </div>
    </div>
  );
}

export default Feedback;