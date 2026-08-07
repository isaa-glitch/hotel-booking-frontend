import React, { useState, useEffect } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import moment from "moment";
import {
  FaArrowLeft,
  FaBed,
  FaCalendarAlt,
  FaLock,
  FaCheckCircle,
  FaUsers,
  FaTag,
  FaExpandArrowsAlt,
  FaEye,
  FaImages,
} from "react-icons/fa";

function PublicRoomDetailsModal({ room, hotel, onBack, onProceedToCheckout }) {
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [availability, setAvailability] = useState({ bookings: [], holds: [] });

  // Date Selection States (Stored as YYYY-MM-DD strings)
  const [selectedStart, setSelectedStart] = useState("");
  const [selectedEnd, setSelectedEnd] = useState("");

  useEffect(() => {
    if (room) {
      fetchRoomAvailability();
      setSelectedStart("");
      setSelectedEnd("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [room]);

  const fetchRoomAvailability = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/bookings/room-availability/${room._id}`,
      );
      setAvailability(res.data.data || { bookings: [], holds: [] });
    } catch (err) {
      console.error("Failed to load calendar data", err);
    } finally {
      setLoading(false);
    }
  };

  if (!room || !hotel) return null;

  // Generate 30 days starting from today using Moment.js
  const daysArray = Array.from({ length: 30 }, (_, i) => {
    return moment().add(i, "days");
  });

  // Check status of an individual date against inventory using Moment
  const getDayStatus = (momentDate) => {
    const bookingCount = availability.bookings.filter((b) => {
      return momentDate.isBetween(
        moment(b.startDate),
        moment(b.endDate),
        "day",
        "[)",
      );
    }).length;

    const holdCount = availability.holds.filter((h) => {
      return momentDate.isBetween(
        moment(h.startDate),
        moment(h.endDate),
        "day",
        "[)",
      );
    }).length;

    if (bookingCount + holdCount >= (room.totalRooms || 1)) {
      return bookingCount >= (room.totalRooms || 1) ? "booked" : "hold";
    }
    return "available";
  };

  const handleDateClick = (dateStr) => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(dateStr);
      setSelectedEnd("");
    } else if (moment(dateStr).isAfter(moment(selectedStart))) {
      setSelectedEnd(dateStr);
    } else {
      setSelectedStart(dateStr);
      setSelectedEnd("");
    }
  };

  const handleLockAndReserve = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in to reserve rooms.");
    if (!selectedStart || !selectedEnd) {
      return alert(
        "Please select Check-In and Check-Out dates from the calendar.",
      );
    }

    setHolding(true);
    try {
      const res = await axios.post(
        "/api/bookings/hold",
        {
          hotelId: hotel._id,
          roomId: room._id,
          startDate: selectedStart,
          endDate: selectedEnd,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const holdData = res.data.data;
      onProceedToCheckout(holdData, selectedStart, selectedEnd);
    } catch (err) {
      alert(
        "Reservation Error: " +
          (err.response?.data?.message || "Room sold out for selected dates."),
      );
      fetchRoomAvailability();
    } finally {
      setHolding(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Navigation Bar */}
        <button onClick={onBack} style={styles.backBtn}>
          <FaArrowLeft /> Back to Hotel Details
        </button>

        <div style={styles.headerBox}>
          <span style={styles.hotelBadge}>{hotel.hotelName}</span>
          <h1 style={styles.title}>{room.roomType}</h1>
        </div>

        <div style={styles.layout}>
          {/* LEFT COLUMN: Full Room Showcase */}
          <div style={styles.leftCol}>
            {/* Gallery */}
            <div style={styles.galleryBox}>
              {room.images && room.images.length > 0 ? (
                <div style={styles.imgGrid}>
                  {room.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Room ${i + 1}`}
                      style={{
                        ...styles.galleryImg,
                        gridColumn: i === 0 ? "span 2" : "span 1",
                        gridRow: i === 0 ? "span 2" : "span 1",
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div style={styles.noImg}>
                  <FaImages size={32} /> No Room Photos Uploaded
                </div>
              )}
            </div>

            {/* Room Features Bar */}
            <div style={styles.featuresBar}>
              <div style={styles.featureItem}>
                <FaBed style={{ color: "#34d399", fontSize: "18px" }} />
                <div>
                  <span style={styles.featureLabel}>Bed Type</span>
                  <strong style={styles.featureValue}>
                    {room.bedType || "Standard Bed"}
                  </strong>
                </div>
              </div>
              <div style={styles.featureItem}>
                <FaUsers style={{ color: "#38bdf8", fontSize: "18px" }} />
                <div>
                  <span style={styles.featureLabel}>Capacity</span>
                  <strong style={styles.featureValue}>
                    Max {room.maxGuests || 2} Guests
                  </strong>
                </div>
              </div>
              {room.squareFootage && (
                <div style={styles.featureItem}>
                  <FaExpandArrowsAlt
                    style={{ color: "#facc15", fontSize: "18px" }}
                  />
                  <div>
                    <span style={styles.featureLabel}>Room Size</span>
                    <strong style={styles.featureValue}>
                      {room.squareFootage} sq. ft.
                    </strong>
                  </div>
                </div>
              )}
              {room.viewType && (
                <div style={styles.featureItem}>
                  <FaEye style={{ color: "#c084fc", fontSize: "18px" }} />
                  <div>
                    <span style={styles.featureLabel}>View</span>
                    <strong style={styles.featureValue}>{room.viewType}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>About This Room</h3>
              <p style={styles.descText}>
                {room.description ||
                  "Enjoy a comfortable and luxurious stay in our well-appointed room, featuring modern amenities, plush bedding, and an inviting atmosphere designed for ultimate relaxation."}
              </p>
            </div>

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Room Amenities</h3>
                <div style={styles.tagsContainer}>
                  {room.amenities.map((item, i) => (
                    <span key={i} style={styles.tag}>
                      <FaTag style={{ fontSize: "10px", color: "#22d3ee" }} />{" "}
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Compact Live Calendar & Booking Box */}
          <div style={styles.rightCol}>
            <div style={styles.stickyCard}>
              <div style={styles.priceHeader}>
                <div>
                  <span style={styles.priceAmount}>₹{room.pricePerNight}</span>
                  <span style={styles.priceNight}> / night</span>
                </div>
                <span style={styles.taxText}>Includes all taxes & fees</span>
              </div>

              {/* COMPACT CALENDAR SECTION */}
              <div style={styles.calendarContainer}>
                <div style={styles.calHeader}>
                  <h4 style={styles.calTitle}>
                    <FaCalendarAlt style={{ color: "#3b82f6" }} /> Select Your
                    Dates
                  </h4>
                  <div style={styles.legend}>
                    <span style={styles.legItem}>
                      <span style={{ ...styles.dot, background: "#10b981" }} />{" "}
                      Open
                    </span>
                    <span style={styles.legItem}>
                      <span style={{ ...styles.dot, background: "#f59e0b" }} />{" "}
                      Hold
                    </span>
                    <span style={styles.legItem}>
                      <span style={{ ...styles.dot, background: "#ef4444" }} />{" "}
                      Full
                    </span>
                  </div>
                </div>

                {loading ? (
                  <div style={styles.loaderBox}>
                    <ClipLoader color="#22d3ee" size={30} />
                  </div>
                ) : (
                  <div style={styles.compactGrid}>
                    {daysArray.map((momentObj, idx) => {
                      const dateStr = momentObj.format("YYYY-MM-DD");
                      const status = getDayStatus(momentObj);
                      const isStart = selectedStart === dateStr;
                      const isEnd = selectedEnd === dateStr;
                      const isBetween =
                        selectedStart &&
                        selectedEnd &&
                        momentObj.isBetween(
                          selectedStart,
                          selectedEnd,
                          "day",
                          "()",
                        );
                      const isSelected = isStart || isEnd || isBetween;

                      let bg = "rgba(255,255,255,0.03)";
                      let borderColor = "rgba(255,255,255,0.08)";
                      if (status === "booked") {
                        bg = "rgba(239, 68, 68, 0.15)";
                        borderColor = "rgba(239, 68, 68, 0.4)";
                      } else if (status === "hold") {
                        bg = "rgba(245, 158, 11, 0.15)";
                        borderColor = "rgba(245, 158, 11, 0.4)";
                      } else if (isSelected) {
                        bg = "rgba(34, 211, 238, 0.25)";
                        borderColor = "#22d3ee";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={status !== "available" && !isSelected}
                          onClick={() => handleDateClick(dateStr)}
                          style={{
                            ...styles.dayCell,
                            background: bg,
                            borderColor: borderColor,
                            opacity:
                              status !== "available" && !isSelected ? 0.4 : 1,
                            cursor:
                              status !== "available" && !isSelected
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          <span style={styles.dayName}>
                            {momentObj.format("ddd")}
                          </span>
                          <strong
                            style={{
                              fontSize: "13px",
                              color: isSelected ? "#22d3ee" : "#fff",
                            }}
                          >
                            {momentObj.format("D")}
                          </strong>
                          <span
                            style={{
                              ...styles.statusTiny,
                              color:
                                status === "booked"
                                  ? "#fca5a5"
                                  : status === "hold"
                                    ? "#fde047"
                                    : "#86efac",
                            }}
                          >
                            {status === "booked"
                              ? "Full"
                              : status === "hold"
                                ? "Hold"
                                : "•"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Dates Display */}
              <div style={styles.selectedBox}>
                <div style={styles.dateField}>
                  <span style={styles.dateLabel}>CHECK-IN</span>
                  <strong style={styles.dateVal}>
                    {selectedStart
                      ? moment(selectedStart).format("MMM Do, YYYY")
                      : "Add Date"}
                  </strong>
                </div>
                <div style={styles.dateDivider}>➡️</div>
                <div style={styles.dateField}>
                  <span style={styles.dateLabel}>CHECK-OUT</span>
                  <strong style={styles.dateVal}>
                    {selectedEnd
                      ? moment(selectedEnd).format("MMM Do, YYYY")
                      : "Add Date"}
                  </strong>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleLockAndReserve}
                disabled={holding || !selectedStart || !selectedEnd}
                style={{
                  ...styles.lockBtn,
                  opacity: !selectedStart || !selectedEnd ? 0.5 : 1,
                }}
              >
                {holding ? (
                  <ClipLoader color="#fff" size={18} />
                ) : (
                  <>
                    <FaLock /> Lock & Proceed (10-Min Hold)
                  </>
                )}
              </button>

              <p style={styles.guaranteeText}>
                ⚡ Your dates will be held exclusively for 10 minutes while you
                complete checkout.
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
  wrapper: { maxWidth: "1200px", margin: "0 auto", padding: "0 24px" },
  backBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "24px",
    fontWeight: 600,
    transition: "background 0.2s",
  },
  headerBox: { marginBottom: "28px" },
  hotelBadge: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#22d3ee",
    textTransform: "uppercase",
    letterSpacing: "1px",
    display: "block",
    marginBottom: "6px",
  },
  title: { fontSize: "36px", fontWeight: 800, margin: 0, color: "#fff" },

  layout: {
    display: "flex",
    gap: "32px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  leftCol: {
    flex: 1.6,
    minWidth: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  rightCol: { flex: 1, minWidth: "340px", position: "sticky", top: "100px" },

  galleryBox: {
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#1e293b",
  },
  imgGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridAutoRows: "140px",
    gap: "10px",
    padding: "10px",
  },
  galleryImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "12px",
  },
  noImg: {
    height: "280px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
  },

  featuresBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "12px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "16px",
    borderRadius: "16px",
  },
  featureItem: { display: "flex", alignItems: "center", gap: "12px" },
  featureLabel: {
    display: "block",
    fontSize: "11px",
    color: "#9ca3af",
    textTransform: "uppercase",
  },
  featureValue: { fontSize: "14px", color: "#fff" },

  sectionCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "24px",
    borderRadius: "16px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 700,
    margin: "0 0 14px 0",
    color: "#fff",
  },
  descText: {
    fontSize: "15px",
    color: "#cbd5e1",
    lineHeight: "1.7",
    margin: 0,
  },

  tagsContainer: { display: "flex", flexWrap: "wrap", gap: "10px" },
  tag: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#e5e7eb",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 500,
  },

  stickyCard: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
  },
  priceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    paddingBottom: "16px",
    marginBottom: "20px",
  },
  priceAmount: { fontSize: "32px", fontWeight: 800, color: "#facc15" },
  priceNight: { fontSize: "14px", color: "#9ca3af" },
  taxText: { fontSize: "11px", color: "#6b7280", alignSelf: "center" },

  calendarContainer: { marginBottom: "20px" },
  calHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    flexWrap: "wrap",
    gap: "8px",
  },
  calTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  legend: { display: "flex", gap: "10px", fontSize: "11px", color: "#9ca3af" },
  legItem: { display: "flex", alignItems: "center", gap: "4px" },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    display: "inline-block",
  },
  loaderBox: { padding: "40px", display: "flex", justifyContent: "center" },

  // Compact 7-Column Mini Grid
  compactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "6px",
  },
  dayCell: {
    border: "1px solid",
    borderRadius: "8px",
    padding: "6px 2px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    transition: "all 0.15s",
  },
  dayName: { fontSize: "9px", color: "#9ca3af", textTransform: "uppercase" },
  statusTiny: { fontSize: "8px", fontWeight: 700, textTransform: "uppercase" },

  selectedBox: {
    display: "flex",
    alignItems: "center",
    justify: "space-between",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px",
    padding: "12px 16px",
    marginBottom: "20px",
  },
  dateField: { flex: 1 },
  dateLabel: {
    display: "block",
    fontSize: "10px",
    color: "#9ca3af",
    fontWeight: 700,
    marginBottom: "2px",
  },
  dateVal: { fontSize: "13px", color: "#fff", fontWeight: 600 },
  dateDivider: { padding: "0 8px", color: "#6b7280", fontSize: "12px" },

  lockBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    border: "none",
    color: "#000",
    padding: "16px",
    borderRadius: "14px",
    fontWeight: 800,
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 6px 20px rgba(245, 158, 11, 0.3)",
    transition: "transform 0.2s",
  },
  guaranteeText: {
    margin: "14px 0 0 0",
    fontSize: "11px",
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: "1.5",
  },
};

export default PublicRoomDetailsModal;
