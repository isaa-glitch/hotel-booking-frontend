import React from "react";
import { ClipLoader } from "react-spinners";
import { FaCheck, FaTimes, FaSearch, FaFileExcel } from "react-icons/fa"; // <-- ADDED EXCEL ICON
import axios from "axios";
import useSearch from "../../hooks/useSearch"; // Adjust path if needed

function HotelBookingsManager() {
  // Use universal search hook pointing to hotel admin bookings endpoint
  const {
    filters,
    updateFilter,
    data: bookings,
    paginationMeta,
    loading,
  } = useSearch("/api/bookings/admin-bookings", {
    keyword: "",
    sortBy: "newest",
    page: 1,
    limit: 10,
  });

  const handleStatusUpdate = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this booking?`))
      return;
    try {
      const token = localStorage.getItem("token");
      const endpoint = action === "approve" ? "approve" : "cancel";
      await axios.patch(
        `/api/bookings/${endpoint}/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      window.location.reload(); // Simple reload or re-fetch trigger
    } catch (err) {
      alert(`Error trying to ${action} booking.`);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    if (
      !window.confirm(
        "Has the guest checked out? Mark this booking as completed?",
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/bookings/complete/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Booking marked as completed!");
      window.location.reload();
    } catch (error) {
      alert("Error completing booking.");
    }
  };

  // --- NEW: HANDLE EXCEL DOWNLOAD ---
  const handleDownloadBookingsExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/bookings/export/excel", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Bookings_Report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to export Excel report.");
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Reservation Requests</h2>
          <p style={styles.subtitle}>Review and approve customer bookings.</p>
        </div>

        {/* Universal Search & Sort Bar */}
        <div style={styles.searchSortBox}>
          <div style={styles.searchWrapper}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search guest email..."
              value={filters.keyword || ""}
              onChange={(e) => updateFilter("keyword", e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <select
            value={filters.sortBy || "newest"}
            onChange={(e) => updateFilter("sortBy", e.target.value)}
            style={styles.sortSelect}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          {/* NEW: EXCEL EXPORT BUTTON */}
          <button onClick={handleDownloadBookingsExcel} style={styles.excelBtn}>
            <FaFileExcel /> Export Bookings
          </button>
        </div>
      </div>

      {loading ? (
        <div style={styles.loaderBox}>
          <ClipLoader color="#22d3ee" size={36} />
        </div>
      ) : bookings.length === 0 ? (
        <div style={styles.emptyText}>
          No bookings found for your properties.
        </div>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>GUEST</th>
                <th style={styles.th}>HOTEL</th>
                <th style={styles.th}>DATES</th>
                <th style={styles.th}>TOTAL</th>
                <th style={styles.th}>STATUS</th>
                <th style={{ ...styles.th, textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} style={styles.tr}>
                  <td style={styles.tdBold}>
                    {b.userId?.email || "Unknown User"}
                  </td>
                  <td style={styles.td}>{b.hotelId?.hotelName || "N/A"}</td>
                  <td style={styles.td}>
                    <div style={{ fontSize: "11px" }}>
                      In: {new Date(b.startDate).toLocaleDateString()}
                      <br />
                      Out: {new Date(b.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={styles.tdBold}>₹{b.price}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        background:
                          b.status === "approved" || b.status === "completed"
                            ? "rgba(34,197,94,0.15)"
                            : b.status === "cancelled"
                              ? "rgba(239,68,68,0.15)"
                              : "rgba(234,179,8,0.15)",
                        color:
                          b.status === "approved" || b.status === "completed"
                            ? "#86efac"
                            : b.status === "cancelled"
                              ? "#fca5a5"
                              : "#fde047",
                        border: `1px solid ${b.status === "approved" || b.status === "completed" ? "rgba(34,197,94,0.4)" : b.status === "cancelled" ? "rgba(239,68,68,0.4)" : "rgba(234,179,8,0.4)"}`,
                      }}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    {b.status === "pending" && (
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          onClick={() => handleStatusUpdate(b._id, "approve")}
                          style={styles.btnApprove}
                        >
                          <FaCheck /> Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(b._id, "reject")}
                          style={styles.btnReject}
                        >
                          <FaTimes /> Reject
                        </button>
                      </div>
                    )}
                    {b.status === "approved" && (
                      <button
                        onClick={() => handleCompleteBooking(b._id)}
                        style={styles.btnComplete}
                      >
                        ✓ Mark as Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Universal Pagination Bar */}
          <div style={styles.paginationBar}>
            <div style={styles.limitBox}>
              <span style={styles.paginationText}>Show:</span>
              <select
                value={filters.limit || 10}
                onChange={(e) => updateFilter("limit", Number(e.target.value))}
                style={styles.limitSelect}
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
              </select>
            </div>
            <div style={styles.navBox}>
              <button
                disabled={filters.page === 1}
                onClick={() => updateFilter("page", filters.page - 1)}
                style={{
                  ...styles.pageBtn,
                  opacity: filters.page === 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <span style={styles.paginationText}>
                Page {filters.page} of {paginationMeta.totalPages || 1}
              </span>
              <button
                disabled={filters.page >= (paginationMeta.totalPages || 1)}
                onClick={() => updateFilter("page", filters.page + 1)}
                style={{
                  ...styles.pageBtn,
                  opacity:
                    filters.page >= (paginationMeta.totalPages || 1) ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "18px",
    padding: "24px",
    color: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: { fontSize: "20px", fontWeight: 700, margin: "0 0 4px 0" },
  subtitle: { color: "#9ca3af", fontSize: "13px", margin: 0 },
  searchSortBox: { display: "flex", gap: "12px", alignItems: "center" },
  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    color: "#6b7280",
    fontSize: "12px",
  },
  searchInput: {
    padding: "8px 12px 8px 32px",
    borderRadius: "8px",
    background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff",
    outline: "none",
    fontSize: "12px",
  },
  sortSelect: {
    padding: "8px 12px",
    borderRadius: "8px",
    background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff",
    outline: "none",
    fontSize: "12px",
  },

  // NEW STYLE: excelBtn
  excelBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid rgba(16, 185, 129, 0.4)",
    background: "rgba(16, 185, 129, 0.15)",
    color: "#10b981",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: {
    color: "#6b7280",
    fontSize: "11px",
    fontWeight: 700,
    padding: "12px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  },
  tr: { borderBottom: "1px solid rgba(255, 255, 255, 0.04)" },
  tdBold: { padding: "12px", color: "#fff", fontWeight: 600, fontSize: "13px" },
  td: { padding: "12px", color: "#d1d5db", fontSize: "13px" },
  badge: {
    padding: "4px 8px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: 700,
  },
  btnApprove: {
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    color: "#86efac",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: 600,
  },
  btnReject: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    color: "#fca5a5",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: 600,
  },
  btnComplete: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "11px",
  },
  loaderBox: { display: "flex", justifyContent: "center", padding: "60px 0" },
  emptyText: {
    textAlign: "center",
    padding: "60px 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  paginationBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "24px",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
  },
  limitBox: { display: "flex", alignItems: "center", gap: "10px" },
  navBox: { display: "flex", gap: "12px", alignItems: "center" },
  paginationText: { fontSize: "13px", color: "#9ca3af", fontWeight: 600 },
  limitSelect: {
    background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "8px",
    outline: "none",
    cursor: "pointer",
  },
  pageBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12px",
  },
};

export default HotelBookingsManager;
