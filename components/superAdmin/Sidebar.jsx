import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import {
  FaMapMarkerAlt,
  FaCity,
  FaMap,
  FaSignOutAlt,
  FaClipboardList,
  FaBuilding,
  FaKey,
  FaChartPie, // <-- Added for the Overview tab
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Sidebar({ activeTab, setActiveTab }) {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Animate sidebar sliding in on mount
    gsap.fromTo(
      sidebarRef.current,
      { x: -80, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
    );
  }, []);

  function handleMouseEnter(e) {
    gsap.to(e.currentTarget, {
      x: 6,
      scale: 1.02,
      duration: 0.2,
      ease: "power2.out",
    });
  }

  function handleMouseLeave(e) {
    gsap.to(e.currentTarget, {
      x: 0,
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  }

  // ADDED the "overview" tab to the top of your menu list
  const menuItems = [
    { id: "overview", label: "Global Analytics", icon: <FaChartPie /> }, // <-- NEW BUTTON
    { id: "requests", label: "Admin Onboarding", icon: <FaClipboardList /> },
    { id: "hotels", label: "Property Moderation", icon: <FaBuilding /> },
    { id: "states", label: "States", icon: <FaMap /> },
    { id: "districts", label: "Districts", icon: <FaMapMarkerAlt /> },
    { id: "cities", label: "Cities", icon: <FaCity /> },
  ];

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }

  return (
    <div ref={sidebarRef} style={styles.sidebar}>
      <div>
        <div style={styles.brand}>
          <div style={styles.logoGlow} />
          <h2 style={styles.brandTitle}>SuperAdmin</h2>
          <p style={styles.brandSubtitle}>Central Control Panel</p>
        </div>

        <div style={styles.navGroup}>
          <p style={styles.navLabel}>MANAGEMENT</p>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                  ...styles.navButton,
                  ...(isActive ? styles.navButtonActive : {}),
                }}
              >
                <span
                  style={{
                    ...styles.icon,
                    color: isActive ? "#fff" : "#22d3ee",
                  }}
                >
                  {item.icon}
                </span>
                <span style={styles.navText}>{item.label}</span>
                {isActive && <div style={styles.activeIndicator} />}
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.footer}>
        <button
          onClick={() => navigate("/reset-password")}
          style={styles.resetButton}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <FaKey style={{ color: "#9ca3af" }} />
          <span>Change Password</span>
        </button>

        <button
          style={styles.logoutButton}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleLogout}
        >
          <FaSignOutAlt style={{ color: "#ef4444" }} />
          <span>Exit Dashboard</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    minHeight: "100vh",
    background: "rgba(10, 10, 15, 0.8)",
    borderRight: "1px solid rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "24px 16px",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    zIndex: 10,
  },
  brand: {
    padding: "12px 12px 24px 12px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
    position: "relative",
  },
  logoGlow: {
    position: "absolute",
    width: "60px",
    height: "60px",
    background:
      "radial-gradient(circle, rgba(34,211,238,0.4), transparent 70%)",
    top: "0",
    left: "10px",
    filter: "blur(20px)",
    zIndex: 0,
  },
  brandTitle: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: 700,
    margin: 0,
    position: "relative",
    zIndex: 1,
    background: "linear-gradient(135deg, #fff, #9ca3af)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  brandSubtitle: {
    color: "#6b7280",
    fontSize: "12px",
    margin: "4px 0 0 0",
    position: "relative",
    zIndex: 1,
  },
  navGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "24px",
  },
  navLabel: {
    color: "#4b5563",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "1px",
    padding: "0 12px",
    marginBottom: "8px",
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid transparent",
    background: "transparent",
    color: "#9ca3af",
    cursor: "pointer",
    textAlign: "left",
    position: "relative",
    overflow: "hidden",
    transition: "background 0.3s, color 0.3s",
  },
  navButtonActive: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#fff",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
  },
  icon: {
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
  },
  navText: {
    fontSize: "14px",
    fontWeight: 500,
  },
  activeIndicator: {
    position: "absolute",
    right: 0,
    top: "20%",
    height: "60%",
    width: "3px",
    background: "linear-gradient(180deg, #22d3ee, #8b5cf6)",
    borderRadius: "4px 0 0 4px",
  },
  footer: {
    paddingTop: "16px",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  resetButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.03)",
    color: "#9ca3af",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    background: "rgba(239, 68, 68, 0.1)",
    color: "#fca5a5",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  },
};

export default Sidebar;
