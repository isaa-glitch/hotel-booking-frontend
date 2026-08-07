import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import gsap from "gsap";
import { FaSearch, FaEdit, FaCheckCircle } from "react-icons/fa";

function HotelAdminForm() {
  const [viewMode, setViewMode] = useState("apply"); // 'apply' | 'otp' | 'success' | 'track' | 'edit'

  const [formData, setFormData] = useState({
    hotelName: "",
    ownerName: "",
    email: "",
    phone: "",
    streetAddress: "",
    stateId: "",
    districtId: "",
    cityId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // OTP State
  const [otpInput, setOtpInput] = useState("");

  // Tracking State
  const [searchId, setSearchId] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [finalTrackingId, setFinalTrackingId] = useState("");

  // Dropdown Memory
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6 },
    );
    axios
      .get("/api/states/allState?isDeleted=false")
      .then((res) => setStatesList(res.data.data || []));
  }, []);

  useEffect(() => {
    if (formData.stateId) {
      axios
        .get(
          `/api/districts/allDistrict?isDeleted=false&stateId=${formData.stateId}`,
        )
        .then((res) => setDistrictsList(res.data.data || []));
    } else setDistrictsList([]);
  }, [formData.stateId]);

  useEffect(() => {
    if (formData.districtId) {
      axios
        .get(
          `/api/cities/allCity?isDeleted=false&districtId=${formData.districtId}`,
        )
        .then((res) => setCitiesList(res.data.data || []));
    } else setCitiesList([]);
  }, [formData.districtId]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // =======================================================
  // 1. OTP WORKFLOW
  // =======================================================
  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/hotel-requests/send-otp", {
        email: formData.email,
      });
      setViewMode("otp");
      setSuccess("OTP sent to your email! (Check backend terminal if testing)");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtpAndSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // 1. Verify OTP
      await axios.post("/api/hotel-requests/verify-otp", {
        email: formData.email,
        otp: otpInput,
      });

      // 2. If valid, Submit the Form immediately
      const res = await axios.post("/api/hotel-requests/create", formData);
      setFinalTrackingId(res.data.trackingId);
      setViewMode("success");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid OTP or submission failed",
      );
    } finally {
      setLoading(false);
    }
  }

  // =======================================================
  // 2. TRACKING & EDITING WORKFLOW
  // =======================================================
  async function handleSearchTracking(e) {
    e.preventDefault();
    setError("");
    setTrackingData(null);
    setLoading(true);
    try {
      const res = await axios.get(`/api/hotel-requests/track/${searchId}`);
      setTrackingData(res.data.data);
    } catch (err) {
      setError("Invalid Tracking ID or request not found.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateSubmission(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.put(
        `/api/hotel-requests/update-track/${trackingData.trackingId}`,
        formData,
      );
      setSuccess("Application updated successfully!");
      setViewMode("track"); // go back to track view
    } catch (err) {
      setError("Failed to update application.");
    } finally {
      setLoading(false);
    }
  }

  const loadDataIntoFormForEdit = () => {
    setFormData({
      hotelName: trackingData.hotelName,
      ownerName: trackingData.ownerName,
      email: trackingData.email,
      phone: trackingData.phone,
      streetAddress: trackingData.address || trackingData.streetAddress,
      stateId: trackingData.stateId?._id || trackingData.stateId,
      districtId: trackingData.districtId?._id || trackingData.districtId,
      cityId: trackingData.cityId?._id || trackingData.cityId,
    });
    setViewMode("edit");
  };

  // Helper UI Renderer for the main Form Fields
  const renderFormFields = () => (
    <>
      <input
        type="text"
        name="hotelName"
        placeholder="Hotel Name"
        value={formData.hotelName}
        onChange={handleChange}
        required
        style={styles.input}
      />
      <input
        type="text"
        name="ownerName"
        placeholder="Owner Name"
        value={formData.ownerName}
        onChange={handleChange}
        required
        style={styles.input}
      />
      <input
        type="email"
        name="email"
        placeholder="Business Email (Needs Verification)"
        value={formData.email}
        onChange={handleChange}
        required
        disabled={viewMode === "edit"}
        style={styles.input}
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
        required
        style={styles.input}
      />
      <select
        name="stateId"
        value={formData.stateId}
        onChange={handleChange}
        required
        style={styles.input}
      >
        <option value="" style={styles.option}>
          -- 1. Select State --
        </option>
        {statesList.map((st) => (
          <option key={st._id} value={st._id} style={styles.option}>
            {st.name}
          </option>
        ))}
      </select>
      <select
        name="districtId"
        value={formData.districtId}
        onChange={handleChange}
        required
        disabled={!formData.stateId}
        style={styles.input}
      >
        <option value="" style={styles.option}>
          -- 2. Select District --
        </option>
        {districtsList.map((dt) => (
          <option key={dt._id} value={dt._id} style={styles.option}>
            {dt.name}
          </option>
        ))}
      </select>
      <select
        name="cityId"
        value={formData.cityId}
        onChange={handleChange}
        required
        disabled={!formData.districtId}
        style={styles.input}
      >
        <option value="" style={styles.option}>
          -- 3. Select City --
        </option>
        {citiesList.map((ct) => (
          <option key={ct._id} value={ct._id} style={styles.option}>
            {ct.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="streetAddress"
        placeholder="Plot No, Landmark..."
        value={formData.streetAddress}
        onChange={handleChange}
        required
        style={styles.input}
      />
    </>
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <div ref={cardRef} style={styles.card}>
        {/* Toggle Navbar */}
        {viewMode !== "success" && viewMode !== "otp" && (
          <div style={styles.topToggle}>
            <button
              onClick={() => {
                setViewMode("apply");
                setError("");
                setSuccess("");
              }}
              style={{
                ...styles.toggleBtn,
                borderBottom:
                  viewMode === "apply"
                    ? "2px solid #22d3ee"
                    : "2px solid transparent",
                color: viewMode === "apply" ? "#fff" : "#6b7280",
              }}
            >
              New Application
            </button>
            <button
              onClick={() => {
                setViewMode("track");
                setError("");
                setSuccess("");
                setTrackingData(null);
              }}
              style={{
                ...styles.toggleBtn,
                borderBottom:
                  viewMode === "track" || viewMode === "edit"
                    ? "2px solid #22d3ee"
                    : "2px solid transparent",
                color:
                  viewMode === "track" || viewMode === "edit"
                    ? "#fff"
                    : "#6b7280",
              }}
            >
              Track / Edit
            </button>
          </div>
        )}

        <h1 style={styles.title}>
          {viewMode === "apply"
            ? "Partner Onboarding"
            : viewMode === "track"
              ? "Track Request"
              : viewMode === "edit"
                ? "Edit Application"
                : "Verification"}
        </h1>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        {/* =========================================
            MODE 1: APPLY (Form fill -> requests OTP) 
            ========================================= */}
        {viewMode === "apply" && (
          <form onSubmit={handleSendOtp} style={styles.form}>
            {renderFormFields()}
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? (
                <ClipLoader color="#fff" size={20} />
              ) : (
                "Verify Email & Submit"
              )}
            </button>
          </form>
        )}

        {/* =========================================
            MODE 2: OTP VERIFICATION & FINAL SUBMIT
            ========================================= */}
        {viewMode === "otp" && (
          <form onSubmit={handleVerifyOtpAndSubmit} style={styles.form}>
            <p
              style={{
                color: "#9ca3af",
                fontSize: "13px",
                textAlign: "center",
                margin: "0 0 10px 0",
              }}
            >
              We sent a 6-digit code to <strong>{formData.email}</strong>
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              required
              style={{
                ...styles.input,
                textAlign: "center",
                fontSize: "18px",
                letterSpacing: "4px",
              }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setViewMode("apply")}
                style={{
                  ...styles.button,
                  flex: 1,
                  background: "transparent",
                  border: "1px solid #6b7280",
                  color: "#9ca3af",
                }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ ...styles.button, flex: 2 }}
              >
                {loading ? (
                  <ClipLoader color="#fff" size={20} />
                ) : (
                  "Verify & Complete"
                )}
              </button>
            </div>
          </form>
        )}

        {/* =========================================
            MODE 3: SUCCESS (Shows final Tracking ID)
            ========================================= */}
        {viewMode === "success" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <FaCheckCircle
              style={{
                color: "#22c55e",
                fontSize: "60px",
                marginBottom: "16px",
              }}
            />
            <h3 style={{ color: "#fff", margin: "0 0 10px 0" }}>
              Application Received!
            </h3>
            <p
              style={{
                color: "#9ca3af",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              Please save your tracking ID. You can use it to check your status
              or edit your details.
            </p>
            <div
              style={{
                background: "rgba(34, 211, 238, 0.1)",
                border: "1px dashed #22d3ee",
                padding: "16px",
                borderRadius: "12px",
                color: "#22d3ee",
                fontSize: "22px",
                fontWeight: "bold",
                letterSpacing: "2px",
                marginBottom: "20px",
              }}
            >
              {finalTrackingId}
            </div>
            <Link
              to="/login"
              style={{ ...styles.button, textDecoration: "none" }}
            >
              Go to Login
            </Link>
          </div>
        )}

        {/* =========================================
            MODE 4: TRACK REQUEST (Search & Display)
            ========================================= */}
        {viewMode === "track" && (
          <div>
            <form
              onSubmit={handleSearchTracking}
              style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
            >
              <input
                type="text"
                placeholder="e.g., HTL-A8F9K2-REQ"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                required
                style={{ ...styles.input, flex: 1 }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0 20px",
                  cursor: "pointer",
                }}
              >
                {loading ? <ClipLoader size={16} color="#fff" /> : <FaSearch />}
              </button>
            </form>

            {trackingData && (
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                    Status:
                  </span>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      background:
                        trackingData.status === "approved"
                          ? "rgba(34,197,94,0.2)"
                          : trackingData.status === "rejected"
                            ? "rgba(239,68,68,0.2)"
                            : "rgba(234,179,8,0.2)",
                      color:
                        trackingData.status === "approved"
                          ? "#86efac"
                          : trackingData.status === "rejected"
                            ? "#fca5a5"
                            : "#fde047",
                    }}
                  >
                    {trackingData.status.toUpperCase()}
                  </span>
                </div>

                <h3 style={{ color: "#fff", margin: "0 0 4px 0" }}>
                  {trackingData.hotelName}
                </h3>
                <p
                  style={{
                    color: "#9ca3af",
                    fontSize: "13px",
                    margin: "0 0 16px 0",
                  }}
                >
                  {trackingData.ownerName} | {trackingData.phone}
                </p>

                {trackingData.status === "rejected" && (
                  <div
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid rgba(239,68,68,0.2)",
                      marginBottom: "16px",
                    }}
                  >
                    <p
                      style={{ color: "#fca5a5", fontSize: "12px", margin: 0 }}
                    >
                      <strong>Reason:</strong> {trackingData.rejectionReason}
                    </p>
                  </div>
                )}

                {(trackingData.status === "pending" ||
                  trackingData.status === "rejected") && (
                  <button
                    onClick={loadDataIntoFormForEdit}
                    style={{
                      ...styles.button,
                      width: "100%",
                      background: "transparent",
                      border: "1px solid #22d3ee",
                      color: "#22d3ee",
                    }}
                  >
                    <FaEdit style={{ marginRight: "8px" }} /> Edit Application
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================
            MODE 5: EDIT EXISTING APPLICATION
            ========================================= */}
        {viewMode === "edit" && (
          <form onSubmit={handleUpdateSubmission} style={styles.form}>
            <div
              style={{
                color: "#22d3ee",
                fontSize: "12px",
                textAlign: "center",
                marginBottom: "10px",
                background: "rgba(34, 211, 238, 0.1)",
                padding: "6px",
                borderRadius: "6px",
              }}
            >
              Editing ID: {trackingData.trackingId}
            </div>
            {renderFormFields()}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setViewMode("track")}
                style={{
                  ...styles.button,
                  flex: 1,
                  background: "transparent",
                  border: "1px solid #6b7280",
                  color: "#9ca3af",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ ...styles.button, flex: 2 }}
              >
                {loading ? (
                  <ClipLoader color="#fff" size={20} />
                ) : (
                  "Update Application"
                )}
              </button>
            </div>
          </form>
        )}

        <p style={styles.bottomText}>
          Already registered?{" "}
          <Link to="/login" style={styles.link}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0a0f",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
    padding: "20px",
    boxSizing: "border-box",
  },
  glowOne: {
    position: "absolute",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(34,211,238,0.3), transparent 70%)",
    top: "-100px",
    right: "-100px",
    filter: "blur(60px)",
  },
  glowTwo: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)",
    bottom: "-80px",
    left: "-80px",
    filter: "blur(60px)",
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "460px",
    padding: "32px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  topToggle: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "24px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  toggleBtn: {
    flex: 1,
    background: "transparent",
    border: "none",
    padding: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.2s",
  },
  title: {
    color: "#fff",
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "20px",
    textAlign: "center",
  },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    padding: "13px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.4)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  option: { background: "#0f172a", color: "#fff" },
  button: {
    padding: "13px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #22d3ee, #8b5cf6)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "46px",
  },
  errorBox: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "10px",
    marginBottom: "18px",
    textAlign: "center",
  },
  successBox: {
    background: "rgba(34,197,94,0.1)",
    border: "1px solid rgba(34,197,94,0.3)",
    color: "#86efac",
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "10px",
    marginBottom: "18px",
    textAlign: "center",
  },
  bottomText: {
    color: "#9ca3af",
    fontSize: "13px",
    textAlign: "center",
    marginTop: "22px",
  },
  link: { color: "#a78bfa", textDecoration: "none", fontWeight: 600 },
};

export default HotelAdminForm;
