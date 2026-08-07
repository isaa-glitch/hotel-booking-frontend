import React, { useState, useEffect } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import moment from "moment";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaTag,
  FaCheckCircle,
  FaShieldAlt,
  FaClock,
} from "react-icons/fa";

function CheckoutView({
  hotel,
  room,
  holdData,
  initialStart,
  initialEnd,
  onBack,
  onSuccess,
}) {
  const [startDate, setStartDate] = useState(initialStart || "");
  const [endDate, setEndDate] = useState(initialEnd || "");
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  // 10-Minute Countdown Timer State (600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    fetchCoupons();

    // Calculate time remaining using Moment based on hold timestamp
    if (holdData?.createdAt) {
      const elapsed = moment().diff(moment(holdData.createdAt), "seconds");
      const remaining = Math.max(600 - elapsed, 0);
      setTimeLeft(remaining);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert(
            "⏳ Your 10-minute room hold has expired! Please re-select your dates.",
          );
          onBack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [holdData]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const fetchCoupons = async () => {
    try {
      const adminId =
        typeof hotel.hotelAdminId === "object"
          ? hotel.hotelAdminId._id
          : hotel.hotelAdminId;
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`/api/coupons/hotel/${adminId}`, { headers });
      setCoupons(res.data.data || []);
    } catch (err) {
      console.error(
        "Could not load coupons:",
        err?.response?.data || err.message,
      );
    }
  };

  const calculatePrice = () => {
    if (!startDate || !endDate)
      return { base: 0, final: 0, nights: 0, discount: 0 };

    const start = moment(startDate);
    const end = moment(endDate);

    // Ensure start date is before check-out date using Moment
    if (!start.isBefore(end))
      return { base: 0, final: 0, nights: 0, discount: 0 };

    // Calculate difference in days (nights) directly
    const nights = end.diff(start, "days");
    let base = nights * room.pricePerNight;
    let discount = 0;

    if (selectedCoupon && base >= selectedCoupon.minBookingAmount) {
      discount =
        selectedCoupon.discountType === "percentage"
          ? base * (selectedCoupon.discountValue / 100)
          : selectedCoupon.discountValue;
    }
    return { base, final: Math.max(base - discount, 0), nights, discount };
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in to complete your booking.");

    const { base, final, nights } = calculatePrice();
    if (nights === 0) return alert("Please check your dates.");

    setLoading(true);
    try {
      await axios.post(
        "/api/bookings/create",
        {
          hotelId: hotel._id,
          roomId: room._id,
          price: final,
          startDate,
          endDate,
          couponId: selectedCoupon ? selectedCoupon._id : null,
          holdId: holdData?._id || null, // Converts TTL hold into permanent booking
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert(
        "🎉 Booking Confirmed securely! You will receive an automated check-in reminder email.",
      );
      onSuccess();
    } catch (err) {
      alert("Checkout failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const pricing = calculatePrice();

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.topBar}>
          <button onClick={onBack} style={styles.backBtn}>
            <FaArrowLeft /> Abandon Checkout
          </button>

          {/* Live Countdown Banner */}
          <div
            style={{
              ...styles.timerBadge,
              borderColor: timeLeft < 120 ? "#ef4444" : "#f59e0b",
            }}
          >
            <FaClock
              style={{ color: timeLeft < 120 ? "#ef4444" : "#f59e0b" }}
            />
            <span>
              Room Locked For:{" "}
              <strong style={{ color: timeLeft < 120 ? "#ef4444" : "#f59e0b" }}>
                {formatTime(timeLeft)}
              </strong>
            </span>
          </div>
        </div>

        <div style={styles.checkoutLayout}>
          <div style={styles.formCol}>
            <h2 style={styles.title}>Confirm Your Reservation</h2>
            <p style={styles.subtitle}>
              You have locked in the{" "}
              <strong style={{ color: "#fff" }}>{room.roomType}</strong> at{" "}
              <strong style={{ color: "#fff" }}>{hotel.hotelName}</strong>.
            </p>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <FaCalendarAlt style={{ color: "#3b82f6" }} /> Locked Dates
              </h3>
              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Check-In Date</label>
                  <input
                    type="date"
                    disabled
                    value={startDate}
                    style={styles.inputDisabled}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Check-Out Date</label>
                  <input
                    type="date"
                    disabled
                    value={endDate}
                    style={styles.inputDisabled}
                  />
                </div>
              </div>
            </div>

            {coupons.length > 0 && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                  <FaTag style={{ color: "#facc15" }} /> Apply Promo Code
                </h3>
                <select
                  value={selectedCoupon ? selectedCoupon._id : ""}
                  onChange={(e) =>
                    setSelectedCoupon(
                      coupons.find((c) => c._id === e.target.value) || null,
                    )
                  }
                  style={styles.input}
                >
                  <option value="">-- No Promo Applied --</option>
                  {coupons.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.couponCode} (
                      {c.discountType === "percentage"
                        ? `${c.discountValue}% OFF`
                        : `₹${c.discountValue} OFF`}
                      )
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={styles.summaryCol}>
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Price Breakdown</h3>
              <div style={styles.priceRow}>
                <span>
                  ₹{room.pricePerNight} × {pricing.nights} nights
                </span>
                <span>₹{pricing.base}</span>
              </div>
              {pricing.discount > 0 && (
                <div
                  style={{
                    ...styles.priceRow,
                    color: "#10b981",
                    fontWeight: 700,
                  }}
                >
                  <span>Coupon Applied</span>
                  <span>-₹{pricing.discount}</span>
                </div>
              )}
              <div style={styles.totalRow}>
                <span>Total Payable</span>
                <span>₹{pricing.final}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || timeLeft === 0}
                style={styles.payBtn}
              >
                {loading ? (
                  <ClipLoader color="#fff" size={20} />
                ) : (
                  <>
                    <FaCheckCircle /> Pay & Confirm Booking
                  </>
                )}
              </button>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "11px",
                  color: "#6b7280",
                  marginTop: "12px",
                }}
              >
                256-bit encrypted reservation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    padding: "20px 0",
    color: "#fff",
    animation: "fadeIn 0.3s ease",
  },
  wrapper: { maxWidth: "1100px", margin: "0 auto", padding: "0 24px" },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "12px",
  },
  backBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 600,
  },
  timerBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(15, 23, 42, 0.9)",
    border: "1px solid",
    padding: "10px 18px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 600,
    boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
  },
  checkoutLayout: {
    display: "flex",
    gap: "40px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  formCol: { flex: 1.5, minWidth: "300px" },
  summaryCol: { flex: 1, minWidth: "300px", position: "sticky", top: "100px" },
  title: { fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0" },
  subtitle: { color: "#9ca3af", margin: "0 0 24px 0", fontSize: "16px" },
  card: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "24px",
    borderRadius: "16px",
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "18px",
    margin: "0 0 20px 0",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#fff",
  },
  row: { display: "flex", gap: "20px" },
  label: {
    display: "block",
    fontSize: "12px",
    color: "#9ca3af",
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "15px",
  },
  inputDisabled: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#9ca3af",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "15px",
    cursor: "not-allowed",
  },
  summaryCard: {
    background: "#1e293b",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "32px",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  },
  summaryTitle: {
    fontSize: "20px",
    margin: "0 0 24px 0",
    fontWeight: 800,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    paddingBottom: "16px",
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    color: "#d1d5db",
    fontSize: "15px",
    marginBottom: "16px",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    color: "#facc15",
    fontSize: "22px",
    fontWeight: 800,
    borderTop: "1px dashed rgba(255,255,255,0.2)",
    paddingTop: "20px",
    marginTop: "8px",
    marginBottom: "32px",
  },
  payBtn: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    border: "none",
    color: "#fff",
    borderRadius: "12px",
    fontWeight: 800,
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: "0 8px 20px rgba(16, 185, 129, 0.4)",
  },
};

export default CheckoutView;
