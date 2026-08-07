import React, { useState, useEffect } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaClock,
  FaBook,
  FaCloudUploadAlt,
  FaTimes,
} from "react-icons/fa";

function AddHotelForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [formData, setFormData] = useState({
    hotelName: "",
    streetAddress: "",
    stateId: "",
    districtId: "",
    cityId: "",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    cancellationPolicy: "Flexible",
    houseRules: "",
  });

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const res = await axios.get("/api/states/allState");
      setStatesList(res.data.data || []);
    } catch (err) {}
  };

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setFormData({ ...formData, stateId, districtId: "", cityId: "" });
    if (!stateId) return;
    const res = await axios.get(
      `/api/districts/allDistrict?stateId=${stateId}`,
    );
    setDistrictsList(res.data.data || []);
  };

  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    setFormData({ ...formData, districtId, cityId: "" });
    if (!districtId) return;
    const res = await axios.get(`/api/cities/allCity?districtId=${districtId}`);
    setCitiesList(res.data.data || []);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const submitData = new FormData();
      Object.keys(formData).forEach((key) =>
        submitData.append(key, formData[key]),
      );
      selectedFiles.forEach((file) => submitData.append("images", file));

      await axios.post("/api/hotels/create", submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Hotel Added! It will be live once the SuperAdmin approves it.");
      onSuccess();
    } catch (err) {
      alert(
        "Error adding hotel: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Register New Property</h2>
          <p style={styles.subtitle}>
            Provide detailed information to attract more guests.
          </p>
        </div>
        {onCancel && (
          <button onClick={onCancel} style={styles.closeBtn}>
            <FaTimes />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* SECTION 1: Basic Info */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>
            <FaBuilding style={{ color: "#22d3ee" }} /> 1. Property Details
          </h4>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Property Name</label>
            <input
              type="text"
              name="hotelName"
              required
              value={formData.hotelName}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., The Grand Ocean Resort"
            />
          </div>

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>State</label>
              <select
                name="stateId"
                required
                value={formData.stateId}
                onChange={handleStateChange}
                style={styles.input}
              >
                <option value="">Select State</option>
                {statesList.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>District</label>
              <select
                name="districtId"
                required
                disabled={!formData.stateId}
                value={formData.districtId}
                onChange={handleDistrictChange}
                style={styles.input}
              >
                <option value="">Select District</option>
                {districtsList.map((dt) => (
                  <option key={dt._id} value={dt._id}>
                    {dt.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>City</label>
              <select
                name="cityId"
                required
                disabled={!formData.districtId}
                value={formData.cityId}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select City</option>
                {citiesList.map((ct) => (
                  <option key={ct._id} value={ct._id}>
                    {ct.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Street Address</label>
            <input
              type="text"
              name="streetAddress"
              required
              value={formData.streetAddress}
              onChange={handleChange}
              style={styles.input}
              placeholder="123 Beachfront Avenue"
            />
          </div>
        </div>

        {/* SECTION 2: Policies & Rules */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>
            <FaClock style={{ color: "#10b981" }} /> 2. Policies & Operations
          </h4>
          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Check-In Time</label>
              <input
                type="time"
                name="checkInTime"
                required
                value={formData.checkInTime}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Check-Out Time</label>
              <input
                type="time"
                name="checkOutTime"
                required
                value={formData.checkOutTime}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Cancellation Policy</label>
              <select
                name="cancellationPolicy"
                value={formData.cancellationPolicy}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="Flexible">
                  Flexible (Free up to 24h before)
                </option>
                <option value="Moderate">
                  Moderate (Free up to 5 days before)
                </option>
                <option value="Strict">Strict (50% refund)</option>
                <option value="Non-refundable">Non-refundable</option>
              </select>
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>House Rules (Optional)</label>
            <textarea
              name="houseRules"
              rows="3"
              value={formData.houseRules}
              onChange={handleChange}
              style={styles.input}
              placeholder="No smoking, No pets allowed, Quiet hours from 10 PM to 6 AM..."
            />
          </div>
        </div>

        {/* SECTION 3: Media */}
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>
            <FaCloudUploadAlt style={{ color: "#facc15" }} /> 3. Property Photos
          </h4>
          <div style={styles.uploadBox}>
            <label style={{ cursor: "pointer", display: "block" }}>
              <FaCloudUploadAlt
                style={{
                  fontSize: "32px",
                  color: "#9ca3af",
                  marginBottom: "8px",
                }}
              />
              <div style={{ color: "#e5e7eb", fontWeight: 600 }}>
                Click to select exterior & lobby photos
              </div>
              <div
                style={{ color: "#6b7280", fontSize: "12px", marginTop: "4px" }}
              >
                Maximum 10 images
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                  setSelectedFiles(Array.from(e.target.files).slice(0, 10))
                }
                style={{ display: "none" }}
              />
            </label>
            {selectedFiles.length > 0 && (
              <div
                style={{
                  marginTop: "12px",
                  color: "#10b981",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {selectedFiles.length} files selected
              </div>
            )}
          </div>
        </div>

        <div style={styles.actions}>
          <button type="submit" disabled={loading} style={styles.saveBtn}>
            {loading ? (
              <ClipLoader color="#fff" size={20} />
            ) : (
              "Submit Property for Review"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "32px",
    color: "#fff",
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    paddingBottom: "16px",
  },
  title: { fontSize: "24px", fontWeight: 800, margin: "0 0 6px 0" },
  subtitle: { color: "#9ca3af", fontSize: "14px", margin: 0 },
  closeBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "none",
    color: "#9ca3af",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
  },
  form: { display: "flex", flexDirection: "column", gap: "24px" },
  section: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "16px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 700,
    margin: "0 0 16px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  row: { display: "flex", gap: "16px", marginBottom: "16px" },
  inputGroup: { marginBottom: "16px" },
  label: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: "8px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  uploadBox: {
    border: "2px dashed rgba(255,255,255,0.2)",
    borderRadius: "12px",
    padding: "32px",
    textAlign: "center",
    background: "rgba(0,0,0,0.3)",
  },
  actions: { display: "flex", justifyContent: "flex-end" },
  saveBtn: {
    padding: "14px 24px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    border: "none",
    color: "#fff",
    borderRadius: "12px",
    fontWeight: 700,
    fontSize: "15px",
    cursor: "pointer",
    width: "100%",
  },
};

export default AddHotelForm;
