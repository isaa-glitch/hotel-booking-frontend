import React, { useState, useEffect } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import {
  FaPlaneDeparture,
  FaWallet,
  FaStar,
  FaBookmark,
  FaCompass,
  FaChevronRight,
  FaHotel,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function UserOverview({
  onSwitchToBookings,
  onSwitchToFindHotel,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/dashboard/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch user analytics", err);
    } finally {
      setLoading(false);
    }
  };

  // Defensive function calls in case props are missing
  const handleGoToFindHotel = () => {
    if (onSwitchToFindHotel) {
      onSwitchToFindHotel();
    } else {
      console.error(
        "onSwitchToFindHotel prop is missing from parent UserDashboard!",
      );
    }
  };

  const handleGoToBookings = () => {
    if (onSwitchToBookings) {
      onSwitchToBookings();
    } else {
      console.error(
        "onSwitchToBookings prop is missing from parent UserDashboard!",
      );
    }
  };

  if (loading || !data) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "100px" }}
      >
        <ClipLoader color="#22d3ee" size={50} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.welcomeTitle}>Your Travel Summary</h1>
        <p style={styles.welcomeSub}>
          A quick overview of your adventures and stays.
        </p>
      </div>

      {/* --- TOP STATS GRID --- */}
      <div style={styles.mainGrid}>
        <div style={styles.statCard}>
          <div style={styles.iconWrapperBlue}>
            <FaWallet size={28} color="#3b82f6" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Lifetime Spent</p>
            <h2 style={styles.statValue}>
              ₹{data.totalSpent?.toLocaleString() || 0}
            </h2>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.iconWrapperGreen}>
            <FaPlaneDeparture size={28} color="#10b981" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Completed Stays</p>
            <h2 style={styles.statValue}>
              {data.totalStays || 0} <span style={styles.statTiny}>trips</span>
            </h2>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.actionCard }}>
          <div style={styles.iconWrapperYellow}>
            <FaStar size={28} color="#facc15" />
          </div>
          <div style={styles.statInfo}>
            <p style={styles.statLabel}>Pending Actions</p>
            <h2 style={styles.statValue}>
              {data.needsReview || 0}{" "}
              <span style={styles.statTiny}>reviews due</span>
            </h2>
          </div>

          {data.needsReview > 0 && (
            <button onClick={handleGoToBookings} style={styles.actionBtn}>
              Leave a Review
            </button>
          )}
        </div>
      </div>

      {/* --- RECENT ACTIVITY & RECOMMENDATIONS --- */}
      <div style={styles.activityGrid}>
        {/* SECTION 1: RECENT BOOKINGS */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              <FaBookmark color="#3b82f6" style={{ marginRight: "8px" }} />{" "}
              Recent Bookings
            </h3>
            <button onClick={handleGoToBookings} style={styles.viewAllBtn}>
              View All <FaChevronRight size={10} />
            </button>
          </div>

          {!data.recentBookings || data.recentBookings.length === 0 ? (
            <div style={styles.emptyStateBox}>
              <p style={styles.emptyText}>No recent booking activity found.</p>
              <button
                onClick={handleGoToFindHotel}
                style={styles.emptyActionBtn}
              >
                Book a Stay
              </button>
            </div>
          ) : (
            <div style={styles.listContainer}>
              {data.recentBookings.slice(0, 4).map((booking) => (
                <div
                  key={booking._id}
                  onClick={handleGoToBookings}
                  style={styles.listItem}
                >
                  <div style={styles.itemIconBox}>
                    <FaHotel size={16} color="#3b82f6" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={styles.itemTitle}>
                      {booking.hotelId?.hotelName || "Hotel Stay"}
                    </h4>
                    <p style={styles.itemSub}>
                      <FaCalendarAlt size={10} style={{ marginRight: "4px" }} />
                      {new Date(booking.startDate).toLocaleDateString()} -{" "}
                      {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={styles.statusPill(booking.status)}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: YOU MAY LIKE / RECOMMENDATIONS (Premium Image Cards) */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              <FaCompass color="#10b981" style={{ marginRight: "8px" }} />{" "}
              Recommended For You
            </h3>
            <button onClick={handleGoToFindHotel} style={styles.viewAllBtn}>
              Explore All <FaChevronRight size={10} />
            </button>
          </div>

          {!data.recommendedHotels || data.recommendedHotels.length === 0 ? (
            <div style={styles.emptyStateBox}>
              <p style={styles.emptyText}>
                Explore properties to get personalized recommendations.
              </p>
              <button
                onClick={handleGoToFindHotel}
                style={styles.emptyActionBtn}
              >
                Find Hotels
              </button>
            </div>
          ) : (
            <div style={styles.recommendedGrid}>
              {data.recommendedHotels.slice(0, 4).map((hotel) => {
                const hotelImage =
                  hotel.images && hotel.images.length > 0
                    ? hotel.images[0]
                    : null;
                return (
                  <div
                    key={hotel._id}
                    onClick={handleGoToFindHotel}
                    style={styles.recCard}
                  >
                    {/* Cover Image Area */}
                    <div style={styles.recImgBox}>
                      {hotelImage ? (
                        <img
                          src={hotelImage}
                          alt={hotel.hotelName}
                          style={styles.recImg}
                        />
                      ) : (
                        <div style={styles.recPlaceholder}>
                          <FaHotel size={24} color="#22d3ee" />
                          <span
                            style={{
                              fontSize: "10px",
                              color: "#22d3ee",
                              marginTop: "4px",
                            }}
                          >
                            No Photo
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Card Content Area */}
                    <div style={styles.recContent}>
                      <h4 style={styles.recTitle}>{hotel.hotelName}</h4>
                      <p style={styles.recSub}>
                        <FaMapMarkerAlt
                          size={10}
                          style={{ color: "#f87171" }}
                        />{" "}
                        {hotel.city ||
                          hotel.streetAddress ||
                          "Explore location"}
                      </p>
                      <button style={styles.recBtn}>View Property</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    color: "#fff",
    animation: "fadeIn 0.3s ease",
    paddingBottom: "40px",
  },
  header: {
    marginBottom: "32px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    paddingBottom: "24px",
  },
  welcomeTitle: {
    fontSize: "28px",
    fontWeight: 800,
    margin: "0 0 6px 0",
    color: "#fff",
  },
  welcomeSub: { color: "#9ca3af", fontSize: "14px", margin: 0 },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },

  statCard: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "32px",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    position: "relative",
    overflow: "hidden",
  },
  actionCard: {
    border: "1px solid rgba(250, 204, 21, 0.3)",
    background: "rgba(250, 204, 21, 0.03)",
  },

  iconWrapperBlue: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    background: "rgba(59, 130, 246, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconWrapperGreen: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    background: "rgba(16, 185, 129, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconWrapperYellow: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    background: "rgba(250, 204, 21, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  statInfo: { display: "flex", flexDirection: "column", gap: "4px" },
  statLabel: {
    margin: 0,
    color: "#9ca3af",
    fontSize: "13px",
    textTransform: "uppercase",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },
  statValue: { margin: 0, fontSize: "32px", fontWeight: 800, color: "#fff" },
  statTiny: { fontSize: "14px", color: "#6b7280", fontWeight: 600 },

  actionBtn: {
    position: "absolute",
    right: "24px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    border: "none",
    color: "#000",
    padding: "10px 16px",
    borderRadius: "10px",
    fontWeight: 800,
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)",
  },

  activityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "24px",
  },
  sectionCard: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    paddingBottom: "12px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    color: "#e2e8f0",
  },
  viewAllBtn: {
    background: "transparent",
    border: "none",
    color: "#22d3ee",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
  },
  listItem: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "12px",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    gap: "12px",
  },

  itemIconBox: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "rgba(59, 130, 246, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemTitle: {
    margin: "0 0 2px 0",
    fontSize: "13px",
    fontWeight: 700,
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemSub: {
    margin: 0,
    fontSize: "11px",
    color: "#9ca3af",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  emptyStateBox: {
    padding: "40px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    flex: 1,
  },
  emptyText: { color: "#6b7280", fontSize: "13px", margin: 0 },
  emptyActionBtn: {
    background: "rgba(34, 211, 238, 0.1)",
    border: "1px solid rgba(34, 211, 238, 0.3)",
    color: "#22d3ee",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  statusPill: (status) => ({
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "9px",
    fontWeight: 700,
    textTransform: "uppercase",
    flexShrink: 0,
    background:
      status === "approved" || status === "completed"
        ? "rgba(34,197,94,0.15)"
        : "rgba(234,179,8,0.15)",
    color:
      status === "approved" || status === "completed" ? "#86efac" : "#fde047",
  }),

  // --- NEW RECOMMENDED HOTEL CARDS ---
  recommendedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    flex: 1,
  },
  recCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "16px",
    overflow: "hidden",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  },
  recImgBox: {
    height: "110px",
    width: "100%",
    position: "relative",
    background: "#1e293b",
  },
  recImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  recPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, rgba(34,211,238,0.1), rgba(139,92,246,0.1))",
  },
  recContent: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  recTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 800,
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  recSub: {
    margin: 0,
    fontSize: "11px",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  recBtn: {
    marginTop: "8px",
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    color: "#10b981",
    padding: "6px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 700,
    textAlign: "center",
    width: "100%",
  },
};
