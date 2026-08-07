import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { FaBed, FaTimes, FaCameraRetro } from "react-icons/fa";

const AVAILABLE_AMENITIES = [
  "Free WiFi",
  "AC",
  "TV",
  "Mini Bar",
  "Bathtub",
  "Balcony",
  "Room Service",
  "Coffee Maker",
  "Ocean View",
  "Work Desk",
  "Hair Dryer",
  "Safe",
  "Kitchenette",
];

function AddRoomModal({ isOpen, onClose, onSuccess, hotel, existingRoom }) {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [roomData, setRoomData] = useState({
    roomType: "",
    description: "",
    squareFootage: "",
    viewType: "City View",
    bedType: "",
    maxGuests: 2,
    totalRooms: 1,
    pricePerNight: "",
    amenities: [],
  });

  useEffect(() => {
    if (existingRoom) {
      setRoomData({
        roomType: existingRoom.roomType || "",
        description: existingRoom.description || "",
        squareFootage: existingRoom.squareFootage || "",
        viewType: existingRoom.viewType || "City View",
        bedType: existingRoom.bedType || "",
        maxGuests: existingRoom.maxGuests || 2,
        totalRooms: existingRoom.totalRooms || 1,
        pricePerNight: existingRoom.pricePerNight || "",
        amenities: existingRoom.amenities || [],
      });
      setSelectedFiles([]); // We don't preload files for editing yet for simplicity
    } else {
      setRoomData({
        roomType: "",
        description: "",
        squareFootage: "",
        viewType: "City View",
        bedType: "",
        maxGuests: 2,
        totalRooms: 1,
        pricePerNight: "",
        amenities: [],
      });
      setSelectedFiles([]);
    }
  }, [existingRoom, isOpen]);

  if (!isOpen || !hotel) return null;

  const handleChange = (e) =>
    setRoomData({ ...roomData, [e.target.name]: e.target.value });

  const handleCheckboxChange = (amenity) => {
    setRoomData((prev) => {
      const isSelected = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: isSelected
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Because we are uploading images, we MUST use FormData
      const submitData = new FormData();
      Object.keys(roomData).forEach((key) => {
        if (key === "amenities") {
          submitData.append(key, JSON.stringify(roomData[key])); // Send array as string
        } else {
          submitData.append(key, roomData[key]);
        }
      });
      selectedFiles.forEach((file) => submitData.append("images", file));

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (existingRoom) {
        await axios.put(
          `/api/hotels/${hotel._id}/rooms/${existingRoom._id}`,
          submitData,
          config,
        );
        alert("Room updated successfully!");
      } else {
        await axios.post(`/api/hotels/${hotel._id}/rooms`, submitData, config);
        alert("Room inventory added successfully!");
      }

      onSuccess();
    } catch (err) {
      alert(
        "Failed to save room: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>
              <FaBed style={{ color: "#10b981", marginRight: "8px" }} />
              {existingRoom ? "Edit Room Details" : "Add Room Category"}
            </h3>
            <p style={styles.subtitle}>Property: {hotel.hotelName}</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={{ flex: 2 }}>
              <label style={styles.label}>Room Category Name</label>
              <input
                type="text"
                name="roomType"
                required
                value={roomData.roomType}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g., Presidential Suite"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Square Footage</label>
              <input
                type="number"
                name="squareFootage"
                value={roomData.squareFootage}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g., 450"
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Bed Configuration</label>
              <input
                type="text"
                name="bedType"
                value={roomData.bedType}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g., 1 King, 1 Sofa Bed"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Scenic View</label>
              <select
                name="viewType"
                value={roomData.viewType}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="City View">City View</option>
                <option value="Ocean View">Ocean View</option>
                <option value="Garden View">Garden View</option>
                <option value="Pool View">Pool View</option>
                <option value="No View">No Specific View</option>
              </select>
            </div>
          </div>

          <div>
            <label style={styles.label}>Room Description</label>
            <textarea
              name="description"
              rows="2"
              value={roomData.description}
              onChange={handleChange}
              style={styles.input}
              placeholder="Describe the layout, ambiance, and unique features..."
            />
          </div>

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Max Guests</label>
              <input
                type="number"
                name="maxGuests"
                min="1"
                required
                value={roomData.maxGuests}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Inventory</label>
              <input
                type="number"
                name="totalRooms"
                min="1"
                required
                value={roomData.totalRooms}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Price / Night (₹)</label>
              <input
                type="number"
                name="pricePerNight"
                required
                value={roomData.pricePerNight}
                onChange={handleChange}
                style={styles.input}
                placeholder="5000"
              />
            </div>
          </div>

          {/* Room Specific Photos */}
          <div>
            <label style={styles.label}>Room Photos</label>
            <div style={styles.uploadBoxSmall}>
              <label
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <FaCameraRetro style={{ fontSize: "20px", color: "#22d3ee" }} />
                <span style={{ color: "#e5e7eb", fontSize: "13px" }}>
                  Upload photos of this specific room
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setSelectedFiles(Array.from(e.target.files).slice(0, 5))
                  }
                  style={{ display: "none" }}
                />
              </label>
              {selectedFiles.length > 0 && (
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "11px",
                    color: "#10b981",
                  }}
                >
                  {selectedFiles.length} files attached
                </div>
              )}
            </div>
          </div>

          {/* Amenities Grid */}
          <div>
            <label style={styles.label}>In-Room Amenities</label>
            <div style={styles.checkboxGrid}>
              {AVAILABLE_AMENITIES.map((amenity) => (
                <label key={amenity} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={roomData.amenities.includes(amenity)}
                    onChange={() => handleCheckboxChange(amenity)}
                    style={styles.checkboxInput}
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.saveBtn}>
              {loading ? <ClipLoader color="#fff" size={16} /> : "Save Room"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

const styles = {
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
    maxWidth: "680px",
    padding: "24px",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.9)",
    color: "#fff",
    boxSizing: "border-box",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "14px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 700,
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  subtitle: { fontSize: "12px", color: "#9ca3af", margin: "4px 0 0 0" },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: "16px",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  row: { display: "flex", gap: "12px" },
  label: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#9ca3af",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginBottom: "6px",
    display: "block",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    background: "rgba(0, 0, 0, 0.5)",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  uploadBoxSmall: {
    border: "1px dashed rgba(34, 211, 238, 0.4)",
    borderRadius: "10px",
    padding: "16px",
    textAlign: "center",
    background: "rgba(34, 211, 238, 0.05)",
  },
  checkboxGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    background: "rgba(255,255,255,0.02)",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#d1d5db",
    cursor: "pointer",
  },
  checkboxInput: {
    cursor: "pointer",
    accentColor: "#10b981",
    width: "14px",
    height: "14px",
  },
  actions: { display: "flex", gap: "12px", marginTop: "8px" },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    background: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#d1d5db",
    borderRadius: "10px",
    fontWeight: 600,
    cursor: "pointer",
  },
  saveBtn: {
    flex: 2,
    padding: "12px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    border: "none",
    color: "#fff",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default AddRoomModal;
