import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import moment from "moment";
import {
  FaTimes,
  FaMapMarkerAlt,
  FaBed,
  FaClock,
  FaHotel,
  FaStar,
} from "react-icons/fa";

function UserBookingDetails({ isOpen, onClose, bookingId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Review States
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBookingDetails();
      setShowReviewForm(false);
      setRating(5);
      setComment("");
    }
  }, [isOpen, bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/bookings/details/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/reviews/create",
        { bookingId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("🎉 Thanks for your feedback!");
      setShowReviewForm(false);
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!isOpen) return null;

  const hotel = data?.booking?.hotelId;
  const hotelImage = hotel?.images?.[0];

  return ReactDOM.createPortal(
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {showReviewForm ? "Rate Your Stay" : "Digital Itinerary"}
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>
            <FaTimes />
          </button>
        </div>

        {loading || !data ? (
          <div style={styles.loaderBox}>
            <ClipLoader color="#22d3ee" size={40} />
          </div>
        ) : showReviewForm ? (
          /* =========================================
             REVIEW FORM VIEW
             ========================================= */
          <div style={styles.body}>
            <div style={styles.hotelBannerMini}>
              <h3 style={styles.hotelNameMini}>{hotel?.hotelName}</h3>
              <p style={styles.hotelAddressMini}>
                {data.roomDetails?.roomType}
              </p>
            </div>

            <label style={styles.inputLabel}>Select Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              style={styles.selectInput}
            >
              <option value={5}>⭐⭐⭐⭐⭐ - Excellent</option>
              <option value={4}>⭐⭐⭐⭐ - Good</option>
              <option value={3}>⭐⭐⭐ - Average</option>
              <option value={2}>⭐⭐ - Poor</option>
              <option value={1}>⭐ - Terrible</option>
            </select>

            <label style={styles.inputLabel}>Your Feedback</label>
            <textarea
              placeholder="Tell us what you loved (or didn't)..."
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={styles.textArea}
            ></textarea>

            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
              <button
                onClick={() => setShowReviewForm(false)}
                style={styles.cancelBtn}
              >
                Back to Itinerary
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                style={styles.submitBtn}
              >
                {submittingReview ? (
                  <ClipLoader color="#fff" size={16} />
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </div>
        ) : (
          /* =========================================
             DIGITAL ITINERARY VIEW
             ========================================= */
          <div style={styles.body}>
            <div
              style={{
                ...styles.hotelBanner,
                backgroundImage: hotelImage ? `url(${hotelImage})` : "none",
              }}
            >
              <div style={styles.bannerOverlay}>
                <div style={styles.hotelTitleGroup}>
                  {!hotelImage && <FaHotel style={styles.fallbackIcon} />}
                  <div>
                    <h3 style={styles.hotelName}>
                      {hotel?.hotelName || "Hotel Details"}
                    </h3>
                    <p style={styles.hotelAddress}>
                      <FaMapMarkerAlt style={{ color: "#f87171" }} />{" "}
                      {hotel?.streetAddress || "Address not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.qrSection}>
              <div style={{ flex: 1 }}>
                <h4 style={styles.sectionTitle}>Booking Status</h4>
                <div
                  style={{
                    display: "inline-block",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    background:
                      data.booking.status === "approved" ||
                      data.booking.status === "confirmed" ||
                      data.booking.status === "completed"
                        ? "rgba(34,197,94,0.15)"
                        : data.booking.status === "cancelled"
                          ? "rgba(239,68,68,0.15)"
                          : "rgba(234,179,8,0.15)",
                    color:
                      data.booking.status === "approved" ||
                      data.booking.status === "confirmed" ||
                      data.booking.status === "completed"
                        ? "#86efac"
                        : data.booking.status === "cancelled"
                          ? "#fca5a5"
                          : "#fde047",
                    border: `1px solid ${
                      data.booking.status === "approved" ||
                      data.booking.status === "confirmed" ||
                      data.booking.status === "completed"
                        ? "rgba(34,197,94,0.4)"
                        : data.booking.status === "cancelled"
                          ? "rgba(239,68,68,0.4)"
                          : "rgba(234,179,8,0.4)"
                    }`,
                  }}
                >
                  {data.booking.status === "pending"
                    ? "Awaiting Confirmation"
                    : data.booking.status}
                </div>

                <div style={{ marginTop: "16px" }}>
                  <p style={styles.metaText}>
                    <strong style={{ color: "#9ca3af" }}>Check-In:</strong>{" "}
                    {moment(data.booking.startDate).format("MMM Do, YYYY")} at{" "}
                    {hotel?.checkInTime || "14:00"}
                  </p>
                  <p style={styles.metaText}>
                    <strong style={{ color: "#9ca3af" }}>Check-Out:</strong>{" "}
                    {moment(data.booking.endDate).format("MMM Do, YYYY")} at{" "}
                    {hotel?.checkOutTime || "11:00"}
                  </p>
                </div>
              </div>

              {/* Show QR Code for active bookings, or Leave Review button for completed ones */}
              {data.booking.status === "completed" ? (
                <div style={styles.actionBox}>
                  <p style={styles.actionSubtext}>How was your stay?</p>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    style={styles.leaveReviewBtn}
                  >
                    <FaStar style={{ marginBottom: "2px" }} /> Leave Review
                  </button>
                </div>
              ) : data.booking.status === "approved" ||
                data.booking.status === "confirmed" ? (
                <div style={styles.qrBox}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${data.booking._id}&color=ffffff&bgcolor=1e293b`}
                    alt="Check-in QR"
                    style={{ borderRadius: "8px", display: "block" }}
                  />
                  <span style={styles.qrSubtext}>Show at Front Desk</span>
                </div>
              ) : null}
            </div>

            <div style={styles.detailsGrid}>
              <div style={styles.gridCard}>
                <div style={styles.gridTitle}>
                  <FaBed style={{ color: "#3b82f6" }} /> Room Details
                </div>
                <div style={styles.cardValueMain}>
                  {data.roomDetails?.roomType || "Standard Room"}
                </div>
                <div style={styles.cardValueSub}>
                  {data.roomDetails?.bedType
                    ? `${data.roomDetails.bedType} • `
                    : ""}{" "}
                  Max {data.roomDetails?.maxGuests || 2} Guests
                </div>
              </div>
              <div style={styles.gridCard}>
                <div style={styles.gridTitle}>
                  <FaClock style={{ color: "#10b981" }} /> Payment Summary
                </div>
                <div style={styles.priceHighlight}>₹{data.booking.price}</div>
                <div style={styles.cardValueSub}>Paid Securely</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "16px",
    boxSizing: "border-box",
    fontFamily: "'Inter', sans-serif",
  },
  modalCard: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "580px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 50px rgba(0,0,0,0.9)",
    color: "#fff",
    overflow: "hidden",
    transition: "all 0.3s ease",
  },
  header: {
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
  },
  title: { fontSize: "18px", fontWeight: 700, margin: 0 },
  closeBtn: {
    background: "rgba(255,255,255,0.08)",
    border: "none",
    color: "#9ca3af",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  body: {
    overflowY: "auto",
    padding: "20px 24px 24px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    animation: "fadeIn 0.3s ease",
  },
  loaderBox: { padding: "60px", display: "flex", justifyContent: "center" },

  // Itinerary Styles
  hotelBanner: {
    minHeight: "150px",
    borderRadius: "16px",
    position: "relative",
    overflow: "hidden",
    background: "#1e293b",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "flex-end",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  bannerOverlay: {
    width: "100%",
    padding: "24px 20px 16px 20px",
    background:
      "linear-gradient(to top, rgba(15, 23, 42, 0.95) 40%, rgba(15, 23, 42, 0.4) 100%)",
  },
  hotelTitleGroup: { display: "flex", alignItems: "center", gap: "12px" },
  fallbackIcon: { fontSize: "28px", color: "#22d3ee" },
  hotelName: {
    margin: "0 0 4px 0",
    fontSize: "22px",
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "0.3px",
  },
  hotelAddress: {
    margin: 0,
    fontSize: "13px",
    color: "#cbd5e1",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  qrSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "20px",
  },
  sectionTitle: {
    fontSize: "11px",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "10px",
    fontWeight: 700,
  },
  metaText: { fontSize: "13px", color: "#f1f5f9", margin: "0 0 6px 0" },
  qrBox: {
    background: "#1e293b",
    padding: "10px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  qrSubtext: {
    fontSize: "10px",
    color: "#9ca3af",
    marginTop: "6px",
    display: "block",
  },
  actionBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    background: "rgba(37, 99, 235, 0.1)",
    padding: "16px",
    borderRadius: "12px",
    border: "1px dashed rgba(37, 99, 235, 0.3)",
  },
  actionSubtext: {
    margin: 0,
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  leaveReviewBtn: {
    background: "#2563eb",
    border: "none",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  detailsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  gridCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "16px",
    borderRadius: "14px",
  },
  gridTitle: {
    fontSize: "11px",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: 700,
  },
  cardValueMain: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: "4px",
  },
  cardValueSub: { fontSize: "12px", color: "#9ca3af" },
  priceHighlight: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#facc15",
    marginBottom: "2px",
  },

  // Review Form Styles
  hotelBannerMini: {
    background: "rgba(34, 211, 238, 0.05)",
    border: "1px solid rgba(34, 211, 238, 0.15)",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "8px",
  },
  hotelNameMini: { margin: "0 0 4px 0", fontSize: "16px", color: "#22d3ee" },
  hotelAddressMini: { margin: 0, fontSize: "13px", color: "#9ca3af" },
  inputLabel: {
    display: "block",
    fontSize: "12px",
    color: "#9ca3af",
    textTransform: "uppercase",
    fontWeight: 700,
  },
  selectInput: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    background: "#1e293b",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.1)",
    fontSize: "14px",
  },
  textArea: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    background: "#1e293b",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.1)",
    boxSizing: "border-box",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
  },
  cancelBtn: {
    flex: 1,
    padding: "14px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
  },
  submitBtn: {
    flex: 1,
    padding: "14px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    border: "none",
    color: "#fff",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

export default UserBookingDetails;
