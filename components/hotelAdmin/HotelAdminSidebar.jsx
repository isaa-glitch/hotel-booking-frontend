import React from "react";
import {
  FaBuilding,
  FaList,
  FaPlus,
  FaSignOutAlt,
  FaTicketAlt,
  FaKey,
  FaCalendarCheck,
  FaThLarge, // <-- Added icon for Overview Analytics
} from "react-icons/fa";

function HotelAdminSidebar({ activeTab, setActiveTab }) {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div style={styles.sidebar}>
      <div>
        <div style={styles.logoBox}>
          <FaBuilding style={{ color: "#22d3ee", fontSize: "24px" }} />
          <span style={styles.logoText}>HOTEL PORTAL</span>
        </div>

        <div style={styles.navGroup}>
          {/* FIXED: Overview Analytics Button now matches all other nav buttons */}
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              ...styles.navBtn,
              ...(activeTab === "overview" ? styles.navBtnActive : {}),
            }}
          >
            <FaThLarge /> Overview Analytics
          </button>

          <button
            onClick={() => setActiveTab("all-hotels")}
            style={{
              ...styles.navBtn,
              ...(activeTab === "all-hotels" ? styles.navBtnActive : {}),
            }}
          >
            <FaList /> All Hotels
          </button>

          <button
            onClick={() => setActiveTab("add-hotel")}
            style={{
              ...styles.navBtn,
              ...(activeTab === "add-hotel" ? styles.navBtnActive : {}),
            }}
          >
            <FaPlus /> Add New Hotel
          </button>

          <button
            onClick={() => setActiveTab("coupons")}
            style={{
              ...styles.navBtn,
              ...(activeTab === "coupons" ? styles.navBtnActive : {}),
            }}
          >
            <FaTicketAlt /> Coupons & Promos
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            style={{
              ...styles.navBtn,
              ...(activeTab === "bookings" ? styles.navBtnActive : {}),
            }}
          >
            <FaCalendarCheck /> Manage Bookings
          </button>
        </div>
      </div>

      {/* Bottom Actions Group */}
      <div style={styles.bottomActions}>
        <button
          onClick={() => (window.location.href = "/reset-password")}
          style={styles.resetBtn}
        >
          <FaKey /> Change Password
        </button>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    background: "rgba(15, 23, 42, 0.8)",
    borderRight: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    zIndex: 10,
    backdropFilter: "blur(10px)",
  },
  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "32px",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  logoText: {
    fontWeight: 800,
    fontSize: "16px",
    letterSpacing: "1px",
    color: "#fff",
  },
  navGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    background: "transparent",
    color: "#9ca3af",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "left",
  },
  navBtnActive: {
    background:
      "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(139,92,246,0.2))",
    color: "#22d3ee",
    border: "1px solid rgba(34,211,238,0.3)",
  },

  bottomActions: { display: "flex", flexDirection: "column", gap: "10px" },
  resetBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#e5e7eb",
    fontWeight: 600,
    cursor: "pointer",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    background: "rgba(239, 68, 68, 0.1)",
    color: "#fca5a5",
    fontWeight: 600,
    cursor: "pointer",
    justifyContent: "center",
  },
};

export default HotelAdminSidebar;
