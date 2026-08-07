import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import gsap from "gsap";
import {
  FaCheck,
  FaTimes,
  FaTrash,
  FaUndo,
  FaEye,
  FaCopy,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaKey,
  FaIdBadge,
  FaPlus,
  FaSearch,
} from "react-icons/fa";
import useSearch from "../../hooks/useSearch"; // Universal Search Hook

function HotelRequestManager() {
  const [statusTab, setStatusTab] = useState("pending");
  const [actionLoading, setActionLoading] = useState(null);

  // Universal Hook Integration
  const {
    filters,
    updateFilter,
    data: requests,
    paginationMeta,
    loading,
  } = useSearch("/api/hotel-requests/all", {
    status: "pending",
    isDeleted: false,
    keyword: "",
    page: 1,
    limit: 10,
  });

  // Modal State for Rejections & Details
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const detailsModalRef = useRef(null);

  // Direct Add Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    ownerName: "",
    email: "",
    phone: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  // Switch tabs and update filter parameters accordingly
  const handleTabSwitch = (tab) => {
    setStatusTab(tab);
    if (tab === "trash") {
      updateFilter("isDeleted", true);
      updateFilter("status", "");
    } else {
      updateFilter("isDeleted", false);
      updateFilter("status", tab);
    }
  };

  useEffect(() => {
    if (detailsModalOpen && detailsModalRef.current) {
      gsap.fromTo(
        detailsModalRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power3.out" },
      );
    }
  }, [detailsModalOpen]);

  const handleDirectAddSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const createRes = await axios.post(
        "/api/hotel-requests/create",
        newAdminData,
      );
      const newRequestId = createRes.data.data._id;
      await axios.patch(`/api/hotel-requests/approve/${newRequestId}`);
      alert("Hotel Admin successfully created & auto-approved!");
      setAddModalOpen(false);
      setNewAdminData({ ownerName: "", email: "", phone: "" });
      handleTabSwitch("approved");
    } catch (err) {
      alert(
        "Error processing admin: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this admin account and send credentials?"))
      return;
    setActionLoading(id);
    try {
      await axios.patch(`/api/hotel-requests/approve/${id}`);
      alert("Admin approved successfully!");
      window.location.reload();
    } catch (err) {
      alert("Error approving admin.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason) return alert("Please enter a reason");
    setActionLoading(selectedRequestId);
    try {
      await axios.patch(`/api/hotel-requests/reject/${selectedRequestId}`, {
        rejectionReason,
      });
      alert("Application rejected!");
      setRejectModalOpen(false);
      setRejectionReason("");
      window.location.reload();
    } catch (err) {
      alert("Error rejecting application.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Hotel Admin Onboarding Directory</h2>
          <p style={styles.subtitle}>
            Review accounts, audit identities, and manage portal access
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Live Search Input */}
          <div style={styles.searchWrapper}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search applicant name..."
              value={filters.keyword || ""}
              onChange={(e) => updateFilter("keyword", e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            style={styles.btnDirectAdd}
          >
            <FaPlus /> Add Hotel Admin
          </button>
        </div>
      </div>

      <div style={styles.tabsGroup}>
        {["pending", "approved", "rejected", "trash"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabSwitch(tab)}
            style={{
              ...styles.tab,
              ...(statusTab === tab ? styles.tabActive : {}),
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loaderBox}>
            <ClipLoader color="#22d3ee" size={36} />
          </div>
        ) : requests.length === 0 ? (
          <div style={styles.emptyText}>No {statusTab} applications found.</div>
        ) : (
          <>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>APPLICANT NAME</th>
                  <th style={styles.th}>CONTACT DETAILS</th>
                  <th style={styles.th}>TRACKING ID</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((item) => (
                  <tr key={item._id} style={styles.tr}>
                    <td style={styles.tdBold}>
                      <FaUser
                        style={{ color: "#22d3ee", marginRight: "8px" }}
                      />
                      {item.ownerName}
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600, color: "#fff" }}>
                        {item.email}
                      </div>
                      <div style={styles.subText}>{item.phone}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.trackingBadge}>
                        {item.trackingId || "N/A"}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <div style={styles.btnGroup}>
                        <button
                          onClick={() => {
                            setSelectedHotel(item);
                            setDetailsModalOpen(true);
                          }}
                          style={styles.btnViewDetails}
                        >
                          <FaEye /> View Details
                        </button>
                        {statusTab === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(item._id)}
                              style={styles.btnApprove}
                            >
                              <FaCheck /> Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequestId(item._id);
                                setRejectModalOpen(true);
                              }}
                              style={styles.btnReject}
                            >
                              <FaTimes /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls Bar */}
            <div style={styles.paginationBar}>
              <div style={styles.limitBox}>
                <span style={styles.paginationText}>Show:</span>
                <select
                  value={filters.limit || 10}
                  onChange={(e) =>
                    updateFilter("limit", Number(e.target.value))
                  }
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
                      filters.page >= (paginationMeta.totalPages || 1)
                        ? 0.5
                        : 1,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* DIRECT ADD MODAL */}
      {addModalOpen &&
        ReactDOM.createPortal(
          <div style={styles.modalOverlay}>
            <div style={styles.rejectModalCard}>
              <h3 style={styles.modalTitle}>Add Hotel Admin</h3>
              <p style={styles.modalSubtitle}>
                This will instantly create an account and email their
                auto-generated credentials.
              </p>
              <form onSubmit={handleDirectAddSubmit}>
                <input
                  type="text"
                  required
                  placeholder="Admin Full Name"
                  value={newAdminData.ownerName}
                  onChange={(e) =>
                    setNewAdminData({
                      ...newAdminData,
                      ownerName: e.target.value,
                    })
                  }
                  style={styles.inputField}
                />
                <input
                  type="email"
                  required
                  placeholder="Business Email"
                  value={newAdminData.email}
                  onChange={(e) =>
                    setNewAdminData({ ...newAdminData, email: e.target.value })
                  }
                  style={styles.inputField}
                />
                <input
                  type="text"
                  required
                  placeholder="Phone Number"
                  value={newAdminData.phone}
                  onChange={(e) =>
                    setNewAdminData({ ...newAdminData, phone: e.target.value })
                  }
                  style={styles.inputField}
                />

                <div style={styles.modalActions}>
                  <button
                    type="submit"
                    disabled={isAdding}
                    style={{
                      ...styles.btnApprove,
                      flex: 1,
                      padding: "10px",
                      justifyContent: "center",
                    }}
                  >
                    {isAdding ? (
                      <ClipLoader color="#fff" size={14} />
                    ) : (
                      "Create & Send Email"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    style={styles.btnCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* VIEW DETAILS MODAL */}
      {detailsModalOpen &&
        selectedHotel &&
        ReactDOM.createPortal(
          <div style={styles.modalOverlay}>
            <div ref={detailsModalRef} style={styles.detailsModalCard}>
              <div style={styles.detailsHeader}>
                <div>
                  <span
                    style={{
                      ...styles.statusBadge,
                      background:
                        selectedHotel.status === "approved"
                          ? "rgba(34,197,94,0.15)"
                          : selectedHotel.status === "rejected"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(234,179,8,0.15)",
                      color:
                        selectedHotel.status === "approved"
                          ? "#86efac"
                          : selectedHotel.status === "rejected"
                            ? "#fca5a5"
                            : "#fde047",
                    }}
                  >
                    {selectedHotel.status?.toUpperCase() || "PENDING"}
                  </span>
                  <h3 style={styles.detailsTitle}>{selectedHotel.ownerName}</h3>
                  <p style={styles.detailsSub}>
                    Tracking ID: {selectedHotel.trackingId || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  style={styles.closeIconBtn}
                >
                  <FaTimes />
                </button>
              </div>

              <div style={styles.detailsGrid}>
                <div style={styles.gridBox}>
                  <div style={styles.gridLabel}>
                    <FaUser /> APPLICANT NAME
                  </div>
                  <div style={styles.gridVal}>{selectedHotel.ownerName}</div>
                </div>

                <div style={styles.gridBox}>
                  <div style={styles.gridLabel}>
                    <FaIdBadge /> TRACKING ID
                  </div>
                  <div style={styles.gridVal}>
                    {selectedHotel.trackingId || "N/A"}
                  </div>
                </div>

                <div style={styles.gridBox}>
                  <div style={styles.gridLabel}>
                    <FaEnvelope /> BUSINESS EMAIL
                  </div>
                  <div style={styles.gridVal}>{selectedHotel.email}</div>
                </div>

                <div style={styles.gridBox}>
                  <div style={styles.gridLabel}>
                    <FaPhone /> CONTACT PHONE
                  </div>
                  <div style={styles.gridVal}>{selectedHotel.phone}</div>
                </div>
              </div>

              {selectedHotel.status === "approved" && (
                <div style={styles.credentialsBox}>
                  <div style={styles.credHeader}>
                    <FaKey style={{ color: "#22d3ee" }} />
                    <span style={styles.credTitle}>
                      Active Admin Credentials
                    </span>
                    {selectedHotel.isPasswordChanged && (
                      <span style={styles.changedBadge}>
                        Password Changed by Admin
                      </span>
                    )}
                  </div>
                  <p style={styles.credDesc}>
                    These are the initial credentials assigned upon approval.
                  </p>
                  <div style={styles.credRow}>
                    <div>
                      <div style={styles.credLabel}>LOGIN EMAIL</div>
                      <div style={styles.credText}>{selectedHotel.email}</div>
                    </div>
                  </div>
                  <div style={styles.credRow}>
                    <div>
                      <div style={styles.credLabel}>TEMPORARY PASSWORD</div>
                      <div style={styles.credPassword}>
                        {selectedHotel.isPasswordChanged
                          ? "•••••••• (Updated by User)"
                          : selectedHotel.temporaryPassword || "N/A"}
                      </div>
                    </div>
                    {!selectedHotel.isPasswordChanged &&
                      selectedHotel.temporaryPassword && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedHotel.temporaryPassword,
                            );
                            alert("Password copied to clipboard!");
                          }}
                          style={styles.copyBtn}
                        >
                          <FaCopy /> Copy
                        </button>
                      )}
                  </div>
                </div>
              )}

              {selectedHotel.status === "rejected" && (
                <div style={styles.rejectionBox}>
                  <div style={styles.rejectHeader}>
                    <FaTimes style={{ color: "#ef4444" }} />
                    <span style={styles.rejectTitle}>
                      Rejection Explanation
                    </span>
                  </div>
                  <p style={styles.rejectText}>
                    {selectedHotel.rejectionReason ||
                      "No explanation recorded."}
                  </p>
                </div>
              )}

              <div style={styles.detailsFooter}>
                <span style={styles.dateText}>
                  Submitted:{" "}
                  {selectedHotel.createdAt
                    ? new Date(selectedHotel.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  style={styles.btnDone}
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* REJECTION REASON MODAL */}
      {rejectModalOpen &&
        ReactDOM.createPortal(
          <div style={styles.modalOverlay}>
            <div style={styles.rejectModalCard}>
              <h3 style={styles.modalTitle}>Reason for Rejection</h3>
              <p style={styles.modalSubtitle}>
                This explanation will be emailed directly to the applicant.
              </p>
              <form onSubmit={handleRejectSubmit}>
                <textarea
                  rows={4}
                  placeholder="e.g., Unverified business phone number or incomplete identification..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  style={styles.textarea}
                />
                <div style={styles.modalActions}>
                  <button type="submit" style={styles.btnRejectSubmit}>
                    Send Rejection Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(false)}
                    style={styles.btnCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

const styles = {
  card: {
    padding: "24px",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    minHeight: "80vh",
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: { fontSize: "22px", fontWeight: 700, margin: "0 0 4px 0" },
  subtitle: { color: "#9ca3af", fontSize: "13px", margin: 0 },
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
    width: "200px",
  },
  btnDirectAdd: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: "none",
    padding: "9px 16px",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tabsGroup: {
    display: "flex",
    gap: "8px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "10px",
    marginBottom: "16px",
  },
  tab: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    padding: "8px 14px",
    borderRadius: "8px",
  },
  tabActive: { background: "rgba(34, 211, 238, 0.15)", color: "#22d3ee" },
  tableContainer: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: {
    color: "#6b7280",
    fontSize: "11px",
    fontWeight: 700,
    padding: "10px 14px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  },
  tr: { borderBottom: "1px solid rgba(255, 255, 255, 0.04)" },
  tdBold: {
    padding: "14px",
    fontWeight: 600,
    fontSize: "13px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
  },
  td: {
    padding: "14px",
    color: "#9ca3af",
    fontSize: "13px",
    verticalAlign: "middle",
  },
  subText: { fontSize: "11px", color: "#6b7280", marginTop: "4px" },
  trackingBadge: {
    background: "rgba(139, 92, 246, 0.15)",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    color: "#c4b5fd",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontFamily: "monospace",
    fontWeight: 700,
  },
  btnGroup: {
    display: "flex",
    gap: "6px",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  btnViewDetails: {
    background: "rgba(34, 211, 238, 0.15)",
    border: "1px solid rgba(34, 211, 238, 0.3)",
    color: "#67e8f9",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: 600,
    fontSize: "11px",
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
    fontWeight: 600,
    fontSize: "11px",
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
    fontWeight: 600,
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "16px",
    boxSizing: "border-box",
  },
  detailsModalCard: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "540px",
    padding: "24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)",
    maxHeight: "85vh",
    overflowY: "auto",
    boxSizing: "border-box",
    margin: "auto",
  },
  rejectModalCard: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "18px",
    width: "100%",
    maxWidth: "400px",
    padding: "22px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)",
    boxSizing: "border-box",
    margin: "auto",
  },
  detailsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "14px",
    marginBottom: "16px",
  },
  statusBadge: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1px",
    border: "1px solid",
    marginBottom: "6px",
  },
  detailsTitle: {
    fontSize: "20px",
    fontWeight: 700,
    margin: "0 0 2px 0",
    color: "#fff",
  },
  detailsSub: {
    fontSize: "11px",
    color: "#6b7280",
    margin: 0,
    fontFamily: "monospace",
  },
  closeIconBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "none",
    color: "#9ca3af",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px",
  },
  gridBox: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    padding: "12px",
    borderRadius: "12px",
  },
  gridLabel: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#6b7280",
    letterSpacing: "0.5px",
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  gridVal: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#fff",
    wordBreak: "break-word",
  },
  credentialsBox: {
    background:
      "linear-gradient(145deg, rgba(34,211,238,0.08), rgba(139,92,246,0.08))",
    border: "1px solid rgba(34,211,238,0.3)",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "16px",
  },
  credHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  },
  credTitle: { fontSize: "14px", fontWeight: 700, color: "#fff", flex: 1 },
  changedBadge: {
    fontSize: "10px",
    background: "rgba(234,179,8,0.2)",
    color: "#fde047",
    padding: "2px 6px",
    borderRadius: "10px",
    border: "1px solid rgba(234,179,8,0.4)",
  },
  credDesc: {
    fontSize: "11px",
    color: "#9ca3af",
    margin: "0 0 12px 0",
    lineHeight: "1.4",
  },
  credRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(0,0,0,0.4)",
    padding: "10px 12px",
    borderRadius: "10px",
    marginBottom: "6px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  credLabel: {
    fontSize: "9px",
    fontWeight: 700,
    color: "#6b7280",
    letterSpacing: "0.5px",
    marginBottom: "2px",
  },
  credText: { fontSize: "13px", fontWeight: 600, color: "#22d3ee" },
  credPassword: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#facc15",
    fontFamily: "monospace",
    letterSpacing: "1px",
  },
  copyBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    padding: "5px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: 600,
  },
  rejectionBox: {
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "16px",
  },
  rejectHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  rejectTitle: { fontSize: "14px", fontWeight: 700, color: "#fca5a5" },
  rejectText: {
    fontSize: "13px",
    color: "#fff",
    margin: 0,
    lineHeight: "1.4",
    background: "rgba(0,0,0,0.3)",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(239,68,68,0.2)",
  },
  detailsFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    paddingTop: "14px",
  },
  dateText: { fontSize: "11px", color: "#6b7280" },
  btnDone: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 20px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: 700,
    margin: "0 0 4px 0",
    color: "#fff",
  },
  modalSubtitle: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: "0 0 14px 0",
    lineHeight: "1.4",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    background: "rgba(0, 0, 0, 0.5)",
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "16px",
    fontFamily: "inherit",
    fontSize: "13px",
    lineHeight: "1.4",
  },
  modalActions: { display: "flex", gap: "10px" },
  btnRejectSubmit: {
    flex: 1,
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
  },
  btnCancel: {
    background: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    color: "#9ca3af",
    padding: "10px 16px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
  },
  inputField: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    background: "rgba(0, 0, 0, 0.5)",
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "12px",
    fontSize: "13px",
  },
};

export default HotelRequestManager;
