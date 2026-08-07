import React, { useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import {
  FaTimes,
  FaBuilding,
  FaMapMarkerAlt,
  FaBed,
  FaImages,
  FaTags,
  FaPlus,
  FaClock,
  FaShieldAlt,
  FaEdit,
  FaExpandArrowsAlt,
  FaEye,
} from "react-icons/fa";

function HotelDetailsModal({
  isOpen,
  onClose,
  hotel,
  onAddRoomClick,
  onEditHotelClick,
}) {
  // --- INLINE ROOM EDITING STATE ---
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [roomFormData, setRoomFormData] = useState({});
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [saving, setSaving] = useState(false);

  // Start editing a specific room
  const handleEditClick = (room) => {
    setEditingRoomId(room._id);
    setRoomFormData({
      roomType: room.roomType || "",
      pricePerNight: room.pricePerNight || "",
      totalRooms: room.totalRooms || "",
      description: room.description || "",
    });
    setExistingImages(room.images || []);
    setDeletedImages([]);
    setNewImages([]);
  };

  // Mark an existing room image for deletion
  const handleRemoveExistingImage = (imgUrl) => {
    setDeletedImages([...deletedImages, imgUrl]);
    setExistingImages(existingImages.filter((img) => img !== imgUrl));
  };

  // Submit the updated room data
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Append text data
      formData.append("roomType", roomFormData.roomType);
      formData.append("pricePerNight", roomFormData.pricePerNight);
      formData.append("totalRooms", roomFormData.totalRooms);
      formData.append("description", roomFormData.description);

      // Append images to delete
      formData.append("deletedRoomImages", JSON.stringify(deletedImages));

      // Append new files
      for (let i = 0; i < newImages.length; i++) {
        formData.append("roomImages", newImages[i]);
      }

      // NOTE: Ensure your backend has a route to update a specific room subdocument
      await axios.patch(
        `/api/hotels/${hotel._id}/rooms/${editingRoomId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      alert("Room updated successfully!");
      setEditingRoomId(null); // Close inline edit
      // Optionally trigger a refresh callback here if you pass one as a prop
    } catch (err) {
      alert(
        "Error updating room: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !hotel) return null;

  return ReactDOM.createPortal(
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        {/* Modal Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.badge}>ACTIVE PROPERTY</span>
            <h2 style={styles.title}>{hotel.hotelName}</h2>
            <p style={styles.address}>
              <FaMapMarkerAlt style={{ color: "#f87171" }} />{" "}
              {hotel.streetAddress}, {hotel.cityId?.name || "City"},{" "}
              {hotel.stateId?.name || "State"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {onEditHotelClick && (
              <button
                onClick={() => onEditHotelClick(hotel)}
                style={styles.editHotelBtn}
              >
                <FaEdit /> Edit Info
              </button>
            )}
            <button onClick={onClose} style={styles.closeBtn}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={styles.body}>
          {/* Policies & Info Section (Unchanged) */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>
              <FaClock style={{ color: "#facc15" }} /> Property Policies
            </h4>
            <div style={styles.policyGrid}>
              <div style={styles.policyCard}>
                <strong>Check-In Time</strong>
                <p>{hotel.checkInTime || "14:00"}</p>
              </div>
              <div style={styles.policyCard}>
                <strong>Check-Out Time</strong>
                <p>{hotel.checkOutTime || "11:00"}</p>
              </div>
              <div style={styles.policyCard}>
                <strong>Cancellation</strong>
                <p>{hotel.cancellationPolicy || "Flexible"}</p>
              </div>
            </div>

            {hotel.houseRules && hotel.houseRules.length > 0 && (
              <div style={styles.houseRulesBox}>
                <strong>
                  <FaShieldAlt style={{ color: "#ef4444" }} /> House Rules:
                </strong>
                <ul
                  style={{
                    margin: "8px 0 0 0",
                    paddingLeft: "20px",
                    color: "#d1d5db",
                    fontSize: "12px",
                  }}
                >
                  {hotel.houseRules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Photo Gallery Section (Unchanged) */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>
              <FaImages style={{ color: "#22d3ee" }} /> Property Gallery (
              {hotel.images?.length || 0})
            </h4>
            {hotel.images && hotel.images.length > 0 ? (
              <div style={styles.imageGrid}>
                {hotel.images.map((imgUrl, index) => (
                  <div key={index} style={styles.imageBox}>
                    <img
                      src={imgUrl}
                      alt={`Property ${index + 1}`}
                      style={styles.img}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyBox}>
                No photos have been uploaded for this property yet.
              </div>
            )}
          </div>

          {/* Room Inventory Section */}
          <div style={styles.section}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h4 style={{ ...styles.sectionTitle, marginBottom: 0 }}>
                <FaBed style={{ color: "#34d399" }} /> Room Categories (
                {hotel.rooms?.length || 0})
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onAddRoomClick(hotel);
                }}
                style={styles.addRoomBtnSmall}
              >
                <FaPlus style={{ fontSize: "10px" }} /> Add Room Type
              </button>
            </div>

            {hotel.rooms && hotel.rooms.length > 0 ? (
              <div style={styles.roomsContainer}>
                {hotel.rooms.map((room, idx) => {
                  // --- INLINE EDIT FORM FOR ROOM ---
                  if (editingRoomId === room._id) {
                    return (
                      <form
                        key={idx}
                        onSubmit={handleSaveRoom}
                        style={styles.roomCard}
                      >
                        <h4 style={{ color: "#fff", margin: "0 0 16px 0" }}>
                          Edit Room: {room.roomType}
                        </h4>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <div>
                            <label style={styles.inlineLabel}>Room Type</label>
                            <input
                              type="text"
                              value={roomFormData.roomType}
                              onChange={(e) =>
                                setRoomFormData({
                                  ...roomFormData,
                                  roomType: e.target.value,
                                })
                              }
                              style={styles.inlineInput}
                              required
                            />
                          </div>
                          <div>
                            <label style={styles.inlineLabel}>
                              Price Per Night (₹)
                            </label>
                            <input
                              type="number"
                              value={roomFormData.pricePerNight}
                              onChange={(e) =>
                                setRoomFormData({
                                  ...roomFormData,
                                  pricePerNight: e.target.value,
                                })
                              }
                              style={styles.inlineInput}
                              required
                            />
                          </div>
                          <div>
                            <label style={styles.inlineLabel}>
                              Total Rooms Available
                            </label>
                            <input
                              type="number"
                              value={roomFormData.totalRooms}
                              onChange={(e) =>
                                setRoomFormData({
                                  ...roomFormData,
                                  totalRooms: e.target.value,
                                })
                              }
                              style={styles.inlineInput}
                              required
                            />
                          </div>
                        </div>

                        <label style={styles.inlineLabel}>Description</label>
                        <textarea
                          rows={2}
                          value={roomFormData.description}
                          onChange={(e) =>
                            setRoomFormData({
                              ...roomFormData,
                              description: e.target.value,
                            })
                          }
                          style={{
                            ...styles.inlineInput,
                            marginBottom: "16px",
                          }}
                        />

                        {/* Room Photos Manager */}
                        <div
                          style={{
                            padding: "12px",
                            background: "rgba(0,0,0,0.3)",
                            borderRadius: "8px",
                            marginBottom: "16px",
                          }}
                        >
                          <label style={styles.inlineLabel}>
                            Manage Existing Room Photos
                          </label>
                          {existingImages.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                                marginBottom: "12px",
                              }}
                            >
                              {existingImages.map((imgUrl, i) => (
                                <div
                                  key={i}
                                  style={{
                                    position: "relative",
                                    width: "70px",
                                    height: "50px",
                                  }}
                                >
                                  <img
                                    src={imgUrl}
                                    alt="Room"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      borderRadius: "6px",
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveExistingImage(imgUrl)
                                    }
                                    style={styles.deleteImgBtn}
                                  >
                                    X
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: "12px", color: "#6b7280" }}>
                              No existing photos.
                            </p>
                          )}

                          <label style={styles.inlineLabel}>
                            Upload Additional Photos
                          </label>
                          <input
                            type="file"
                            multiple
                            onChange={(e) => setNewImages(e.target.files)}
                            style={{ color: "#fff", fontSize: "12px" }}
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setEditingRoomId(null)}
                            style={styles.cancelInlineBtn}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={saving}
                            style={styles.saveInlineBtn}
                          >
                            {saving ? "Saving..." : "Save Room Details"}
                          </button>
                        </div>
                      </form>
                    );
                  }

                  // --- NORMAL ROOM VIEW ---
                  return (
                    <div key={idx} style={styles.roomCard}>
                      {room.images && room.images.length > 0 && (
                        <div style={styles.roomImageGallery}>
                          {room.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Room"
                              style={styles.roomMiniImg}
                            />
                          ))}
                        </div>
                      )}

                      <div style={styles.roomHeader}>
                        <div>
                          <span style={styles.roomName}>{room.roomType}</span>
                          <div style={styles.roomSubInfo}>
                            {room.bedType && <span>{room.bedType} • </span>}
                            <span>Max {room.maxGuests || 2} Guests</span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              marginTop: "6px",
                            }}
                          >
                            {room.squareFootage && (
                              <span style={styles.miniTag}>
                                <FaExpandArrowsAlt /> {room.squareFootage} sq ft
                              </span>
                            )}
                            {room.viewType && (
                              <span style={styles.miniTag}>
                                <FaEye /> {room.viewType}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <span style={styles.roomPrice}>
                            ₹{room.pricePerNight}{" "}
                            <small style={styles.perNightText}>/ night</small>
                          </span>
                          <br />
                          {/* CHANGED TO TRIGGER INLINE EDIT */}
                          <button
                            onClick={() => handleEditClick(room)}
                            style={styles.editRoomBtn}
                          >
                            Edit Room Info
                          </button>
                        </div>
                      </div>

                      {room.description && (
                        <p style={styles.roomDesc}>{room.description}</p>
                      )}

                      <div style={styles.roomMeta}>
                        <span style={styles.inventoryBadge}>
                          📦 Total Inventory:{" "}
                          <strong>{room.totalRooms} Rooms</strong>
                        </span>
                      </div>

                      {room.amenities && room.amenities.length > 0 && (
                        <div style={styles.amenitiesWrapper}>
                          <span style={styles.amenitiesLabel}>
                            <FaTags /> Amenities:
                          </span>
                          <div style={styles.tagsContainer}>
                            {room.amenities.map((item, i) => (
                              <span key={i} style={styles.tag}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={styles.emptyBox}>
                No rooms added yet. Click "Add Room Type" above to set up your
                inventory!
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={styles.footer}>
          <span style={styles.dateText}>
            Listed on: {new Date(hotel.createdAt).toLocaleDateString()}
          </span>
          <button onClick={onClose} style={styles.closeFooterBtn}>
            Close Details
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const styles = {
  // Existing Styles
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
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
    fontFamily: "'Inter', sans-serif",
  },
  modalCard: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "780px",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.9)",
    color: "#fff",
    boxSizing: "border-box",
    margin: "auto",
  },
  header: {
    padding: "24px 24px 16px 24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  badge: {
    display: "inline-block",
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    color: "#86efac",
    padding: "3px 8px",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1px",
    marginBottom: "6px",
  },
  title: {
    fontSize: "24px",
    fontWeight: 800,
    margin: "0 0 4px 0",
    color: "#fff",
  },
  address: {
    fontSize: "13px",
    color: "#9ca3af",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  editHotelBtn: {
    background: "rgba(34, 211, 238, 0.15)",
    border: "1px solid rgba(34, 211, 238, 0.4)",
    color: "#22d3ee",
    height: "32px",
    padding: "0 12px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
  },
  closeBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "none",
    color: "#9ca3af",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "16px",
  },
  body: {
    padding: "24px",
    overflowY: "auto",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  section: { display: "flex", flexDirection: "column" },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#e5e7eb",
    margin: "0 0 16px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  policyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "12px",
  },
  policyCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "12px",
  },
  houseRulesBox: {
    background: "rgba(239, 68, 68, 0.05)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "13px",
  },
  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "12px",
  },
  imageBox: {
    aspectRatio: "16/9",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "#1e293b",
  },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  roomsContainer: { display: "flex", flexDirection: "column", gap: "16px" },
  roomCard: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "20px",
  },
  roomImageGallery: {
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    marginBottom: "16px",
    paddingBottom: "8px",
  },
  roomMiniImg: {
    height: "80px",
    width: "120px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  roomHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    paddingBottom: "12px",
  },
  roomName: { fontSize: "18px", fontWeight: 800, color: "#fff" },
  roomPrice: { fontSize: "18px", fontWeight: 800, color: "#facc15" },
  perNightText: { fontSize: "12px", color: "#9ca3af", fontWeight: 400 },
  roomSubInfo: { fontSize: "12px", color: "#9ca3af", marginTop: "4px" },
  miniTag: {
    background: "rgba(255,255,255,0.1)",
    color: "#d1d5db",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  roomDesc: {
    fontSize: "13px",
    color: "#d1d5db",
    margin: "0 0 16px 0",
    fontStyle: "italic",
    lineHeight: "1.5",
  },
  editRoomBtn: {
    background: "transparent",
    border: "1px solid rgba(34, 211, 238, 0.4)",
    color: "#22d3ee",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "8px",
    transition: "all 0.2s",
  },
  roomMeta: { fontSize: "13px", color: "#d1d5db", marginBottom: "12px" },
  inventoryBadge: {
    background: "rgba(34, 211, 238, 0.1)",
    color: "#67e8f9",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    border: "1px solid rgba(34, 211, 238, 0.2)",
  },
  amenitiesWrapper: {
    marginTop: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  amenitiesLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  tagsContainer: { display: "flex", flexWrap: "wrap", gap: "8px" },
  tag: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#e5e7eb",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: 500,
  },
  addRoomBtnSmall: {
    padding: "8px 14px",
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16, 185, 129, 0.4)",
    color: "#86efac",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  emptyBox: {
    padding: "32px",
    textAlign: "center",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px dashed rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    color: "#6b7280",
    fontSize: "13px",
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255,255,255,0.02)",
  },
  dateText: { fontSize: "12px", color: "#6b7280", fontWeight: 500 },
  closeFooterBtn: {
    padding: "10px 24px",
    background: "#2563eb",
    border: "none",
    color: "#fff",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
  },

  // --- NEW STYLES FOR INLINE EDITING ---
  inlineLabel: {
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: 700,
    textTransform: "uppercase",
    display: "block",
    marginBottom: "4px",
  },
  inlineInput: {
    width: "100%",
    padding: "10px",
    background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "12px",
    outline: "none",
    boxSizing: "border-box",
  },
  deleteImgBtn: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "bold",
  },
  cancelInlineBtn: {
    padding: "8px 16px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  saveInlineBtn: {
    padding: "8px 16px",
    background: "#22c55e",
    border: "none",
    color: "#fff",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default HotelDetailsModal;
