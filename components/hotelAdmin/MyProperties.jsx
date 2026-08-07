import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import {
  FaBuilding,
  FaPlus,
  FaBed,
  FaMapMarkerAlt,
  FaEye,
  FaClock,
  FaTimesCircle,
  FaCheckCircle,
  FaChartBar,
  FaSearch,
  FaEdit,
  FaFileExcel, // <-- IMPORT THE EXCEL ICON
} from "react-icons/fa";
import AddRoomModal from "./AddRoomModal";
import HotelDetailsModal from "./HotelDetailsModal";
import SingleHotelDashboard from "./SingleHotelDashboard";
import useSearch from "../../hooks/useSearch"; // Universal Search Hook

function MyProperties({ onAddNewClick }) {
  // Universal Hook Integration
  const {
    filters,
    updateFilter,
    data: hotels,
    paginationMeta,
    loading,
  } = useSearch("/api/hotels/my-hotels", {
    keyword: "",
    page: 1,
    limit: 10,
  });

  // Tab State for filtering
  const [statusTab, setStatusTab] = useState("approved");

  // Modal & View states
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

  // Tracks which hotel dashboard is currently open
  const [activeHotel, setActiveHotel] = useState(null);

  // Local filtering for the tabs (since the API returns all statuses)
  const filteredHotels = hotels.filter((h) => {
    if (statusTab === "approved") return h.isApproved === true;
    if (statusTab === "pending")
      return h.isApproved !== true && !h.rejectionReason;
    if (statusTab === "rejected")
      return h.isApproved !== true && h.rejectionReason;
    return true;
  });

  // Function to manually trigger a refresh via the hook
  const handleSuccessRefresh = () => {
    updateFilter("page", filters.page);
    window.location.reload();
  };

  // --- NEW: HANDLE EXCEL DOWNLOAD ---
  const handleDownloadExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/hotels/export/excel", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // Important for handling binary Excel files
      });

      // Create downloadable blob URL
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Hotel_Report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to export Excel report.");
    }
  };

  // If a hotel is active, ONLY render the dashboard
  if (activeHotel) {
    return (
      <SingleHotelDashboard
        hotel={activeHotel}
        onBack={() => setActiveHotel(null)}
      />
    );
  }

  return (
    <div>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Your Properties Directory</h2>
          <p style={styles.sectionSubtitle}>
            Manage your listings and view their approval status.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Live Search Input */}
          <div style={styles.searchWrapper}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search property name..."
              value={filters.keyword || ""}
              onChange={(e) => updateFilter("keyword", e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* NEW: EXCEL EXPORT BUTTON */}
          <button onClick={handleDownloadExcel} style={styles.excelBtn}>
            <FaFileExcel /> Export Excel
          </button>

          <button onClick={onAddNewClick} style={styles.addBtnSmall}>
            <FaPlus /> Add Hotel
          </button>
        </div>
      </div>

      {/* STATUS TABS */}
      <div style={styles.tabsGroup}>
        {[
          { id: "approved", label: "Approved (Live)", icon: <FaCheckCircle /> },
          { id: "pending", label: "Pending Review", icon: <FaClock /> },
          { id: "rejected", label: "Rejected", icon: <FaTimesCircle /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusTab(tab.id)}
            style={{
              ...styles.tab,
              ...(statusTab === tab.id ? styles.tabActive : {}),
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loaderBox}>
          <ClipLoader color="#22d3ee" size={40} />
        </div>
      ) : filteredHotels.length === 0 ? (
        <div style={styles.emptyCard}>
          <FaBuilding
            style={{ fontSize: "40px", color: "#6b7280", marginBottom: "12px" }}
          />
          <h3>No {statusTab} properties found</h3>
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>
            {statusTab === "approved" &&
              "When the SuperAdmin approves your hotels, they will appear here."}
            {statusTab === "pending" &&
              "You currently have no properties awaiting review."}
            {statusTab === "rejected" &&
              "None of your properties have been rejected."}
          </p>
        </div>
      ) : (
        <>
          <div style={styles.grid}>
            {filteredHotels.map((hotel) => (
              <div
                key={hotel._id}
                style={{
                  ...styles.hotelCard,
                  opacity: statusTab === "rejected" ? 0.8 : 1,
                }}
              >
                <div style={styles.imageBox}>
                  {hotel.images && hotel.images.length > 0 ? (
                    <img
                      src={hotel.images[0]}
                      alt="Hotel"
                      style={styles.cardImage}
                    />
                  ) : (
                    <div style={styles.noImageBox}>No Photos Uploaded</div>
                  )}
                  <span style={styles.photoBadge}>
                    {hotel.images?.length || 0} Photos
                  </span>

                  {statusTab === "pending" && (
                    <div style={styles.pendingBanner}>AWAITING APPROVAL</div>
                  )}
                  {statusTab === "rejected" && (
                    <div style={styles.rejectedBanner}>REJECTED</div>
                  )}
                </div>

                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{hotel.hotelName}</h3>
                  <p style={styles.cardAddress}>
                    <FaMapMarkerAlt style={{ color: "#f87171" }} />{" "}
                    {hotel.streetAddress}, {hotel.cityId?.name || "City"}
                  </p>

                  {statusTab === "rejected" && hotel.rejectionReason && (
                    <div style={styles.rejectionReasonBox}>
                      <strong>Reason:</strong> {hotel.rejectionReason}
                    </div>
                  )}

                  <div style={styles.roomSummary}>
                    <span>Total Room Categories:</span>
                    <span style={styles.roomCountBadge}>
                      {hotel.rooms?.length || 0} Types
                    </span>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <button
                    onClick={() => setActiveHotel(hotel)}
                    style={styles.btnDashboard}
                  >
                    <FaChartBar /> Dashboard
                  </button>

                  <button
                    onClick={() => {
                      setSelectedHotel(hotel);
                      setDetailsModalOpen(true);
                    }}
                    style={styles.btnManageInfo}
                  >
                    <FaEye /> Info
                  </button>

                  <button
                    onClick={() => {
                      setSelectedHotel(hotel);
                      setEditModalOpen(true);
                    }}
                    style={styles.btnEditInfo}
                  >
                    <FaEdit /> Edit
                  </button>

                  <button
                    onClick={() => {
                      setSelectedHotel(hotel);
                      setEditingRoom(null);
                      setRoomModalOpen(true);
                    }}
                    disabled={statusTab === "rejected"}
                    style={{
                      ...styles.btnAddRoom,
                      opacity: statusTab === "rejected" ? 0.5 : 1,
                    }}
                  >
                    <FaBed /> + Room
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls Bar */}
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

      {/* MODAL 1: Add/Edit Room Modal */}
      <AddRoomModal
        isOpen={roomModalOpen}
        hotel={selectedHotel}
        existingRoom={editingRoom}
        onClose={() => setRoomModalOpen(false)}
        onSuccess={handleSuccessRefresh}
      />

      {/* MODAL 2: The Detailed Info Modal */}
      <HotelDetailsModal
        isOpen={detailsModalOpen}
        hotel={selectedHotel}
        onClose={() => setDetailsModalOpen(false)}
        onAddRoomClick={(hotelObj) => {
          if (statusTab === "rejected")
            return alert("Cannot add rooms to a rejected property.");
          setSelectedHotel(hotelObj);
          setEditingRoom(null);
          setRoomModalOpen(true);
        }}
        onEditRoomClick={(hotelObj, roomObj) => {
          setSelectedHotel(hotelObj);
          setEditingRoom(roomObj);
          setRoomModalOpen(true);
        }}
      />

      {/* MODAL 3: Edit Property Details Modal */}
      <EditHotelModal
        isOpen={editModalOpen}
        hotel={selectedHotel}
        onClose={() => setEditModalOpen(false)}
        onSuccess={handleSuccessRefresh}
      />
    </div>
  );
}

// ----------------------------------------------------
// INLINE COMPONENT: EditHotelModal
// ----------------------------------------------------
function EditHotelModal({ isOpen, hotel, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    hotelName: "",
    streetAddress: "",
    cancellationPolicy: "",
    checkInTime: "",
    checkOutTime: "",
  });

  // Image states
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deletedHotelImages, setDeletedHotelImages] = useState([]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hotel) {
      setFormData({
        hotelName: hotel.hotelName || "",
        streetAddress: hotel.streetAddress || "",
        cancellationPolicy: hotel.cancellationPolicy || "",
        checkInTime: hotel.checkInTime || "",
        checkOutTime: hotel.checkOutTime || "",
      });
      setExistingImages(hotel.images || []);
      setDeletedHotelImages([]);
      setNewImages([]);
    }
  }, [hotel]);

  // Mark an existing image for deletion
  const handleRemoveExistingImage = (urlToRemove) => {
    setDeletedHotelImages([...deletedHotelImages, urlToRemove]);
    setExistingImages(existingImages.filter((img) => img !== urlToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      // Use FormData since we are uploading files
      const submitData = new FormData();

      // Append all text fields
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      // Append deleted images array as a JSON string
      submitData.append(
        "deletedHotelImages",
        JSON.stringify(deletedHotelImages),
      );

      // Append brand new image files
      for (let i = 0; i < newImages.length; i++) {
        submitData.append("hotelImages", newImages[i]);
      }

      await axios.patch(`/api/hotels/update/${hotel._id}`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Hotel updated successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      alert(
        "Error updating hotel: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div style={styles.modalOverlay}>
      <div
        style={{
          ...styles.editModalCard,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h3 style={styles.editTitle}>Edit Property Details</h3>
        <form onSubmit={handleSubmit} style={styles.editForm}>
          {/* ----- TEXT FIELDS ----- */}
          <label style={styles.editLabel}>Property Name</label>
          <input
            type="text"
            value={formData.hotelName}
            onChange={(e) =>
              setFormData({ ...formData, hotelName: e.target.value })
            }
            style={styles.editInput}
            required
          />

          <label style={styles.editLabel}>Street Address</label>
          <input
            type="text"
            value={formData.streetAddress}
            onChange={(e) =>
              setFormData({ ...formData, streetAddress: e.target.value })
            }
            style={styles.editInput}
            required
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={styles.editLabel}>Check-in Time</label>
              <input
                type="time"
                value={formData.checkInTime}
                onChange={(e) =>
                  setFormData({ ...formData, checkInTime: e.target.value })
                }
                style={styles.editInput}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.editLabel}>Check-out Time</label>
              <input
                type="time"
                value={formData.checkOutTime}
                onChange={(e) =>
                  setFormData({ ...formData, checkOutTime: e.target.value })
                }
                style={styles.editInput}
              />
            </div>
          </div>

          <label style={styles.editLabel}>Cancellation Policy</label>
          <textarea
            rows={2}
            value={formData.cancellationPolicy}
            onChange={(e) =>
              setFormData({ ...formData, cancellationPolicy: e.target.value })
            }
            style={styles.editInput}
          />

          {/* ----- IMAGE FIELDS ----- */}
          <div
            style={{
              marginTop: "10px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "10px",
            }}
          >
            <label style={styles.editLabel}>Manage Existing Photos</label>
            {existingImages.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "10px",
                }}
              >
                {existingImages.map((imgUrl, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      width: "80px",
                      height: "80px",
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt="Hotel"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(imgUrl)}
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        cursor: "pointer",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                No photos uploaded yet.
              </p>
            )}

            <label style={styles.editLabel}>Upload New Photos</label>
            <input
              type="file"
              multiple
              onChange={(e) => setNewImages(e.target.files)}
              style={styles.editInput}
            />
          </div>

          <div style={styles.editActions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.editCancelBtn}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} style={styles.editSaveBtn}>
              {saving ? <ClipLoader size={14} color="#fff" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

// ----------------------------------------------------
// STYLES
// ----------------------------------------------------
const styles = {
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  sectionTitle: { fontSize: "20px", fontWeight: 700, margin: 0, color: "#fff" },
  sectionSubtitle: { fontSize: "13px", color: "#9ca3af", margin: "4px 0 0 0" },
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
  // NEW STYLE: excelBtn
  excelBtn: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(16, 185, 129, 0.4)",
    background: "rgba(16, 185, 129, 0.15)",
    color: "#10b981",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  addBtnSmall: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  tabsGroup: {
    display: "flex",
    gap: "10px",
    marginBottom: "24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "12px",
  },
  tab: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: "8px",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  tabActive: {
    background: "rgba(34, 211, 238, 0.15)",
    color: "#22d3ee",
    border: "1px solid rgba(34, 211, 238, 0.3)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },
  hotelCard: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "18px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backdropFilter: "blur(10px)",
  },
  imageBox: { height: "180px", position: "relative", background: "#1e293b" },
  cardImage: { width: "100%", height: "100%", objectFit: "cover" },
  noImageBox: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 600,
  },
  photoBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: 600,
    backdropFilter: "blur(4px)",
  },
  pendingBanner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    background: "rgba(234, 179, 8, 0.9)",
    color: "#000",
    padding: "6px",
    textAlign: "center",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1px",
  },
  rejectedBanner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    background: "rgba(239, 68, 68, 0.9)",
    color: "#fff",
    padding: "6px",
    textAlign: "center",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1px",
  },
  cardBody: { padding: "20px", flex: 1 },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    margin: "0 0 6px 0",
    color: "#fff",
  },
  cardAddress: {
    fontSize: "13px",
    color: "#9ca3af",
    margin: "0 0 16px 0",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  rejectionReasonBox: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#fca5a5",
    marginBottom: "16px",
    lineHeight: "1.4",
  },
  roomSummary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
    paddingTop: "12px",
    fontSize: "13px",
    color: "#d1d5db",
  },
  roomCountBadge: {
    background: "rgba(139, 92, 246, 0.15)",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    color: "#c4b5fd",
    padding: "2px 8px",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "11px",
  },
  cardFooter: {
    padding: "12px",
    background: "rgba(0, 0, 0, 0.2)",
    borderTop: "1px solid rgba(255, 255, 255, 0.04)",
    display: "flex",
    gap: "6px",
    flexWrap: "wrap", // Allows buttons to wrap safely
  },
  btnDashboard: {
    flex: "1 1 45%",
    padding: "8px",
    background: "rgba(139, 92, 246, 0.15)",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    color: "#c4b5fd",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "11px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
  },
  btnManageInfo: {
    flex: "1 1 45%",
    padding: "8px",
    background: "rgba(34, 211, 238, 0.15)",
    border: "1px solid rgba(34, 211, 238, 0.3)",
    color: "#67e8f9",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "11px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
  },
  btnEditInfo: {
    flex: "1 1 45%",
    padding: "8px",
    background: "rgba(245, 158, 11, 0.15)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    color: "#fcd34d",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "11px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
  },
  btnAddRoom: {
    flex: "1 1 45%",
    padding: "8px",
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    color: "#86efac",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "11px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
  },
  loaderBox: { display: "flex", justifyContent: "center", padding: "60px 0" },
  emptyCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px dashed rgba(255,255,255,0.1)",
    borderRadius: "18px",
    padding: "60px",
    textAlign: "center",
    color: "#fff",
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

  /* Inline Modal Styles */
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "16px",
    boxSizing: "border-box",
  },
  editModalCard: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "450px",
    padding: "24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)",
  },
  editTitle: {
    color: "#fff",
    fontSize: "18px",
    margin: "0 0 20px 0",
    fontWeight: 700,
  },
  editForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  editLabel: {
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: "4px",
    display: "block",
  },
  editInput: {
    width: "100%",
    padding: "12px",
    background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "13px",
    boxSizing: "border-box",
    outline: "none",
  },
  editActions: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
  },
  editCancelBtn: {
    flex: 1,
    padding: "12px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
  },
  editSaveBtn: {
    flex: 1,
    padding: "12px",
    background: "#2563eb",
    border: "none",
    color: "#fff",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default MyProperties;
