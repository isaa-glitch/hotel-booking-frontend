import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaChevronDown,
  FaSignOutAlt,
  FaKey,
} from "react-icons/fa";

import Sidebar from "./Sidebar";
import LocationManager from "./LocationManager";
import HotelRequestManager from "./HotelRequestManager";
import SuperAdminHotelManager from "./SuperAdminHotelManager";
import SuperAdminOverview from "./SuperAdminOverview";

function SuperAdminDashboard() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState({
    name: "Super Admin",
    email: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setAdminInfo({
      name: storedUser.name || "Super Admin",
      email: storedUser.email || "superadmin@system.com",
    });

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={styles.contentArea}>
        {/* Top Nav with Profile Dropdown */}
        <div style={styles.topNav}>
          <span style={styles.breadcrumb}>
            Super Admin Panel / {activeTab.toUpperCase()}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={styles.adminBadge}>SuperAdmin Active</div>

            {/* PROFILE DROPDOWN */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={styles.profileBtn}
              >
                <FaUserCircle size={18} /> <span>{adminInfo.name}</span>{" "}
                <FaChevronDown size={10} />
              </button>

              {isProfileOpen && (
                <div style={styles.dropdownMenu}>
                  <div style={styles.dropdownHeader}>
                    <p style={styles.dropdownName}>{adminInfo.name}</p>
                    <p style={styles.dropdownEmail}>{adminInfo.email}</p>
                  </div>
                  <div style={styles.dropdownDivider} />

                  <button
                    onClick={() => navigate("/reset-password")}
                    style={styles.actionBtn}
                  >
                    <FaKey /> Change Password
                  </button>
                  <button onClick={handleLogout} style={styles.logoutBtn}>
                    <FaSignOutAlt /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.contentContainer}>
          {activeTab === "overview" ? (
            <SuperAdminOverview />
          ) : activeTab === "requests" ? (
            <HotelRequestManager />
          ) : activeTab === "hotels" ? (
            <SuperAdminHotelManager />
          ) : (
            <LocationManager activeTab={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  // Existing Styles...
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    background: "#0a0a0f",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
  },
  glowOne: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(34,211,238,0.2), transparent 70%)",
    top: "-150px",
    right: "-100px",
    filter: "blur(80px)",
    pointerEvents: "none",
  },
  glowTwo: {
    position: "absolute",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)",
    bottom: "-100px",
    left: "20%",
    filter: "blur(80px)",
    pointerEvents: "none",
  },
  contentArea: {
    flex: 1,
    padding: "32px 48px",
    overflowY: "auto",
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
  },
  topNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    position: "relative",
    zIndex: 50,
  },
  breadcrumb: {
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "1px",
  },
  adminBadge: {
    background: "rgba(34, 211, 238, 0.1)",
    border: "1px solid rgba(34, 211, 238, 0.3)",
    color: "#22d3ee",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
  },
  contentContainer: { flex: 1 },

  // NEW STYLES FOR DROPDOWN
  profileBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
  },
  dropdownMenu: {
    position: "absolute",
    top: "120%",
    right: 0,
    width: "220px",
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px",
    padding: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  dropdownHeader: { display: "flex", flexDirection: "column", gap: "4px" },
  dropdownName: { margin: 0, fontSize: "14px", fontWeight: 700, color: "#fff" },
  dropdownEmail: {
    margin: 0,
    fontSize: "11px",
    color: "#9ca3af",
    wordBreak: "break-all",
  },
  dropdownDivider: {
    height: "1px",
    background: "rgba(255,255,255,0.08)",
    margin: "10px 0",
  },
  actionBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 10px",
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "4px",
    textAlign: "left",
  },
  logoutBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 10px",
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default SuperAdminDashboard;
