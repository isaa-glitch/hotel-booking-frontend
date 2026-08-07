import React from "react";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaImages,
  FaBed,
  FaClock,
  FaShieldAlt,
} from "react-icons/fa";

function PublicHotelDetailsView({ hotel, onBack, onRoomSelect }) {
  if (!hotel) return null;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <button onClick={onBack} style={styles.backBtn}>
          <FaArrowLeft /> Back to Search
        </button>

        {/* Hero Section */}
        <div style={styles.hero}>
          <h1 style={styles.title}>{hotel.hotelName}</h1>
          <p style={styles.address}>
            <FaMapMarkerAlt style={{ color: "#f87171" }} />{" "}
            {hotel.streetAddress}, {hotel.cityId?.name}
          </p>
        </div>

        {/* Photo Gallery */}
        <div style={styles.galleryGrid}>
          {hotel.images && hotel.images.length > 0 ? (
            hotel.images.slice(0, 3).map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Property"
                style={{
                  ...styles.galleryImg,
                  gridRow: i === 0 ? "span 2" : "span 1",
                }}
              />
            ))
          ) : (
            <div style={styles.noImg}>
              <FaImages size={30} /> No Photos Uploaded
            </div>
          )}
        </div>

        <div style={styles.layout}>
          {/* Left Column: Info & Policies */}
          <div style={styles.infoCol}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <FaClock style={{ color: "#facc15" }} /> Property Policies
              </h3>
              <div style={styles.policyBox}>
                <div style={styles.pRow}>
                  <span>Check-In:</span>{" "}
                  <span>{hotel.checkInTime || "14:00"}</span>
                </div>
                <div style={styles.pRow}>
                  <span>Check-Out:</span>{" "}
                  <span>{hotel.checkOutTime || "11:00"}</span>
                </div>
                <div style={styles.pRow}>
                  <span>Cancellation:</span>{" "}
                  <span>{hotel.cancellationPolicy || "Flexible"}</span>
                </div>
              </div>
            </div>

            {hotel.houseRules && hotel.houseRules.length > 0 && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <FaShieldAlt style={{ color: "#ef4444" }} /> House Rules
                </h3>
                <ul style={styles.rulesList}>
                  {hotel.houseRules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Rooms List */}
          <div style={styles.roomsCol}>
            <h3 style={styles.sectionTitle}>
              <FaBed style={{ color: "#34d399" }} /> Select Your Room
            </h3>
            <div style={styles.roomsList}>
              {hotel.rooms?.map((room) => (
                <div key={room._id} style={styles.roomCard}>
                  <div style={{ flex: 1 }}>
                    <h4 style={styles.roomType}>{room.roomType}</h4>
                    <p style={styles.roomMeta}>
                      {room.bedType || "Standard Bed"} • Max{" "}
                      {room.maxGuests || 2} Guests
                    </p>
                    <p style={styles.roomDesc}>
                      {room.description ||
                        "Luxurious accommodation with premium amenities."}
                    </p>
                    {room.amenities && (
                      <div style={styles.tagsContainer}>
                        {room.amenities.slice(0, 4).map((am, i) => (
                          <span key={i} style={styles.tag}>
                            {am}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={styles.roomAction}>
                    <span style={styles.roomPrice}>
                      ₹{room.pricePerNight}{" "}
                      <small style={{ fontSize: "12px", color: "#9ca3af" }}>
                        / night
                      </small>
                    </span>
                    <button
                      onClick={() => onRoomSelect(room)}
                      style={styles.bookBtn}
                    >
                      Book Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { width: "100%", padding: "40px 0" },
  wrapper: { maxWidth: "1200px", margin: "0 auto", padding: "0 24px" },
  backBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "24px",
    fontWeight: 600,
    transition: "background 0.2s",
  },
  hero: { marginBottom: "24px" },
  title: {
    fontSize: "36px",
    fontWeight: 800,
    margin: "0 0 8px 0",
    color: "#fff",
  },
  address: {
    color: "#9ca3af",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "15px",
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gridTemplateRows: "220px 220px",
    gap: "16px",
    marginBottom: "40px",
  },
  galleryImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  noImg: {
    background: "#1e293b",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    gridColumn: "span 2",
    gridRow: "span 2",
  },
  layout: {
    display: "flex",
    gap: "40px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  infoCol: {
    flex: 1,
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  roomsCol: { flex: 2, minWidth: "500px" },
  section: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "24px",
    borderRadius: "16px",
  },
  sectionTitle: {
    fontSize: "18px",
    margin: "0 0 20px 0",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#fff",
  },
  policyBox: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    fontSize: "14px",
    color: "#d1d5db",
  },
  pRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    paddingBottom: "8px",
  },
  rulesList: {
    paddingLeft: "20px",
    margin: 0,
    color: "#d1d5db",
    fontSize: "14px",
    lineHeight: "1.8",
  },
  roomsList: { display: "flex", flexDirection: "column", gap: "20px" },
  roomCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
  },
  roomType: {
    fontSize: "20px",
    fontWeight: 700,
    margin: "0 0 6px 0",
    color: "#fff",
  },
  roomMeta: { color: "#9ca3af", fontSize: "13px", margin: "0 0 12px 0" },
  roomDesc: {
    color: "#d1d5db",
    fontSize: "14px",
    margin: "0 0 16px 0",
    fontStyle: "italic",
    lineHeight: "1.5",
  },
  tagsContainer: { display: "flex", flexWrap: "wrap", gap: "8px" },
  tag: {
    background: "rgba(34, 211, 238, 0.1)",
    border: "1px solid rgba(34, 211, 238, 0.2)",
    color: "#67e8f9",
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 600,
  },
  roomAction: { textAlign: "right", minWidth: "160px" },
  roomPrice: {
    display: "block",
    fontSize: "24px",
    fontWeight: 800,
    color: "#facc15",
    marginBottom: "16px",
  },
  bookBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    fontSize: "14px",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
  },
};

export default PublicHotelDetailsView;
