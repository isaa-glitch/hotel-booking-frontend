import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import {
  FaCheck,
  FaTimes,
  FaBuilding,
  FaPlus,
  FaCloudUploadAlt,
  FaSearch,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaUser,
  FaClock,
  FaShieldAlt,
  FaBed,
  FaStar,
  FaEye,
  FaTimesCircle,
} from "react-icons/fa";
import gsap from "gsap";
import useSearch from "../../hooks/useSearch";

// --- Animated Reusable Components ---
const AnimatedSearch = ({ value, onChange, placeholder }) => {
  const wrapperRef = useRef(null);
  const handleFocus = () =>
    gsap.to(wrapperRef.current, {
      scale: 1.02,
      borderColor: "rgba(34, 211, 238, 0.5)",
      duration: 0.3,
    });
  const handleBlur = () =>
    gsap.to(wrapperRef.current, {
      scale: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
      duration: 0.3,
    });
  return (
    <div ref={wrapperRef} style={styles.fancySearchWrapper}>
      <FaSearch style={styles.fancySearchIcon} />
      <input
        type="text"
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={styles.fancySearchInput}
      />
    </div>
  );
};

const AnimatedSelect = ({ value, onChange, options }) => {
  const selectRef = useRef(null);
  const handleFocus = () =>
    gsap.to(selectRef.current, {
      scale: 1.02,
      borderColor: "rgba(34, 211, 238, 0.5)",
      duration: 0.3,
    });
  const handleBlur = () =>
    gsap.to(selectRef.current, {
      scale: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
      duration: 0.3,
    });
  return (
    <select
      ref={selectRef}
      value={value}
      onChange={onChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={styles.fancySelect}
    >
      {options.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          style={{ background: "#0f172a", color: "#fff" }}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default function SuperAdminHotelManager() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Detailed View Modal State
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [hotelDetailData, setHotelDetailData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [initialLoad, setInitialLoad] = useState(true);

  const [formData, setFormData] = useState({
    hotelAdminId: "",
    hotelName: "",
    streetAddress: "",
    stateId: "",
    districtId: "",
    cityId: "",
  });

  const {
    filters,
    updateFilter,
    data: hotels,
    paginationMeta,
    loading,
  } = useSearch("/api/hotels/super-admin/list", {
    search: "",
    sort: "newest",
    status: "pending",
    page: 1,
    limit: 6,
  });

  useEffect(() => {
    if (!loading && initialLoad) {
      if (
        hotels.length === 0 &&
        filters.status === "pending" &&
        !filters.search
      ) {
        updateFilter("status", "all");
      }
      setInitialLoad(false);
    }
  }, [
    loading,
    hotels,
    filters.status,
    filters.search,
    initialLoad,
    updateFilter,
  ]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [adminsRes, statesRes] = await Promise.all([
        axios.get("/api/hotels/hotel-admins/list", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/states/allState"),
      ]);
      setAdminUsers(adminsRes.data.data || []);
      setStatesList(statesRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch dropdown data", err);
    }
  };

  const openHotelDetails = async (id) => {
    setSelectedHotelId(id);
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/hotels/super-admin/details/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotelDetailData(res.data.data);
    } catch (err) {
      alert("Failed to load hotel details.");
      setSelectedHotelId(null);
    } finally {
      setLoadingDetails(false);
    }
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

  const handleApprove = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Approve and publish this hotel?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/hotels/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      window.location.reload();
    } catch (err) {
      alert("Error approving hotel");
    }
  };

  const handleReject = async (id, e) => {
    if (e) e.stopPropagation();
    const reason = window.prompt(
      "Please provide a reason for rejecting this property listing:",
    );
    if (reason === null) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/hotels/reject/${id}`,
        { rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      window.location.reload();
    } catch (err) {
      alert("Error rejecting hotel");
    }
  };

  const handleDirectAddSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const token = localStorage.getItem("token");
      const submitData = new FormData();
      Object.keys(formData).forEach((key) =>
        submitData.append(key, formData[key]),
      );
      selectedFiles.forEach((file) => submitData.append("images", file));
      submitData.append("isApproved", "true");

      await axios.post("/api/hotels/create", submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Property directly added & approved successfully!");
      setAddModalOpen(false);
      window.location.reload();
    } catch (err) {
      alert(
        "Error creating hotel: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setIsAdding(false);
    }
  };

  const tabs = [
    { id: "pending", label: "Pending Requests" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "all", label: "All Properties" },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Property Moderation</h2>
          <p style={styles.subtitle}>
            Approve pending hotels or directly add new ones.
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          style={styles.btnDirectAdd}
        >
          <FaPlus /> Direct Add Property
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              updateFilter("status", tab.id);
              updateFilter("page", 1);
            }}
            style={{
              ...styles.tabBtn,
              borderBottom:
                filters.status === tab.id
                  ? "2px solid #22d3ee"
                  : "2px solid transparent",
              color: filters.status === tab.id ? "#22d3ee" : "#9ca3af",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div style={styles.filterBar}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <AnimatedSearch
            placeholder="Search hotel name..."
            value={filters.search || ""}
            onChange={(e) => {
              updateFilter("search", e.target.value);
              updateFilter("page", 1);
            }}
          />
        </div>
        <AnimatedSelect
          value={filters.sort || "newest"}
          onChange={(e) => {
            updateFilter("sort", e.target.value);
            updateFilter("page", 1);
          }}
          options={[
            { value: "newest", label: "Newest First" },
            { value: "oldest", label: "Oldest First" },
            { value: "a-z", label: "Name (A-Z)" },
            { value: "z-a", label: "Name (Z-A)" },
          ]}
        />
      </div>

      {/* Content Area */}
      {loading && initialLoad ? (
        <div style={styles.loaderBox}>
          <ClipLoader color="#22d3ee" size={40} />
        </div>
      ) : hotels.length === 0 ? (
        <div style={styles.emptyBox}>No hotels found for this criteria.</div>
      ) : (
        <>
          <div style={styles.grid}>
            {hotels.map((h) => (
              <div
                key={h._id}
                style={styles.card}
                onClick={() => openHotelDetails(h._id)}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.iconBox}>
                    <FaBuilding color="#3b82f6" />
                  </div>
                  <span
                    style={styles.statusPill(
                      h.status || (h.isApproved ? "approved" : "pending"),
                    )}
                  >
                    {h.status || (h.isApproved ? "approved" : "pending")}
                  </span>
                </div>

                <h4 style={styles.hotelName}>{h.hotelName}</h4>
                <p style={styles.detailText}>
                  <FaMapMarkerAlt color="#f87171" />{" "}
                  {h.city?.name || h.city || "No City"} -{" "}
                  {h.streetAddress || "No Address"}
                </p>

                <div style={styles.ownerBox}>
                  <p style={styles.ownerTitle}>Owner Details:</p>
                  <p style={styles.detailText}>
                    <FaEnvelope color="#9ca3af" />{" "}
                    {h.hotelAdminId?.email || "Unknown"}
                  </p>
                </div>

                {h.status === "rejected" && h.rejectionReason && (
                  <div style={styles.rejectionBox}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#fca5a5",
                        marginBottom: "4px",
                      }}
                    >
                      REASON FOR REJECTION:
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#e2e8f0",
                        fontStyle: "italic",
                      }}
                    >
                      "{h.rejectionReason}"
                    </p>
                  </div>
                )}

                {/* Actions & Detail CTA */}
                <div style={{ ...styles.actionsBox, marginTop: "16px" }}>
                  <button
                    onClick={() => openHotelDetails(h._id)}
                    style={styles.btnViewDetails}
                  >
                    <FaEye /> Inspect Full Details
                  </button>
                  {(h.status === "pending" || h.status === "rejected") && (
                    <button
                      onClick={(e) => handleApprove(h._id, e)}
                      style={styles.btnApprove}
                    >
                      <FaCheck />
                    </button>
                  )}
                  {(h.status === "pending" || h.status === "approved") && (
                    <button
                      onClick={(e) => handleReject(h._id, e)}
                      style={styles.btnReject}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div style={styles.paginationMini}>
            <button
              disabled={filters.page === 1}
              onClick={() => updateFilter("page", filters.page - 1)}
              style={styles.pageBtnMini}
            >
              Prev
            </button>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>
              Page {filters.page} of {paginationMeta.totalPages || 1}
            </span>
            <button
              disabled={filters.page >= (paginationMeta.totalPages || 1)}
              onClick={() => updateFilter("page", filters.page + 1)}
              style={styles.pageBtnMini}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* --- ALL-IN-ONE HOTEL DETAILS MODAL --- */}
      {selectedHotelId &&
        ReactDOM.createPortal(
          <div
            style={styles.modalOverlay}
            onClick={() => setSelectedHotelId(null)}
          >
            <div
              style={styles.detailsModalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.detailsHeader}>
                <div>
                  <h3 style={styles.detailsTitle}>
                    {loadingDetails
                      ? "Loading Details..."
                      : hotelDetailData?.hotel?.hotelName || "Hotel Profile"}
                  </h3>
                  {hotelDetailData?.hotel && (
                    <span
                      style={styles.statusPill(
                        hotelDetailData.hotel.isApproved
                          ? "approved"
                          : hotelDetailData.hotel.rejectionReason
                            ? "rejected"
                            : "pending",
                      )}
                    >
                      {hotelDetailData.hotel.isApproved
                        ? "APPROVED & LIVE"
                        : hotelDetailData.hotel.rejectionReason
                          ? "REJECTED"
                          : "PENDING APPROVAL"}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedHotelId(null)}
                  style={styles.closeBtn}
                >
                  <FaTimesCircle size={22} />
                </button>
              </div>

              {loadingDetails || !hotelDetailData ? (
                <div style={{ padding: "60px", textAlign: "center" }}>
                  <ClipLoader color="#22d3ee" size={40} />
                </div>
              ) : (
                <div style={styles.detailsBody}>
                  {/* SECTION 1: HOTEL ADMIN INFO */}
                  <div style={styles.infoSection}>
                    <h4 style={styles.sectionHeaderTitle}>
                      <FaUser color="#22d3ee" /> Hotel Admin / Owner Information
                    </h4>
                    <div style={styles.infoGrid}>
                      <div>
                        <span style={styles.infoLabel}>Name:</span>
                        <p style={styles.infoVal}>
                          {hotelDetailData.hotel.hotelAdminId?.name ||
                            "Not provided"}
                        </p>
                      </div>
                      <div>
                        <span style={styles.infoLabel}>Email:</span>
                        <p style={styles.infoVal}>
                          {hotelDetailData.hotel.hotelAdminId?.email ||
                            "Not provided"}
                        </p>
                      </div>
                      <div>
                        <span style={styles.infoLabel}>Phone:</span>
                        <p style={styles.infoVal}>
                          {hotelDetailData.hotel.hotelAdminId?.phone || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span style={styles.infoLabel}>
                          Account Registered:
                        </span>
                        <p style={styles.infoVal}>
                          {hotelDetailData.hotel.hotelAdminId?.createdAt
                            ? new Date(
                                hotelDetailData.hotel.hotelAdminId.createdAt,
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: HOTEL OVERVIEW & POLICIES */}
                  <div style={styles.infoSection}>
                    <h4 style={styles.sectionHeaderTitle}>
                      <FaBuilding color="#3b82f6" /> Property Overview & Rules
                    </h4>
                    <div style={styles.infoGrid}>
                      <div>
                        <span style={styles.infoLabel}>Address:</span>
                        <p style={styles.infoVal}>
                          {hotelDetailData.hotel.streetAddress}
                        </p>
                      </div>
                      <div>
                        <span style={styles.infoLabel}>Location:</span>
                        <p style={styles.infoVal}>
                          {hotelDetailData.hotel.cityId?.name || "City"},{" "}
                          {hotelDetailData.hotel.districtId?.name || "District"}
                          , {hotelDetailData.hotel.stateId?.name || "State"}
                        </p>
                      </div>
                      <div>
                        <span style={styles.infoLabel}>
                          Check-In / Check-Out:
                        </span>
                        <p style={styles.infoVal}>
                          <FaClock size={12} color="#facc15" />{" "}
                          {hotelDetailData.hotel.checkInTime} /{" "}
                          {hotelDetailData.hotel.checkOutTime}
                        </p>
                      </div>
                      <div>
                        <span style={styles.infoLabel}>
                          Cancellation Policy:
                        </span>
                        <p style={styles.infoVal}>
                          <FaShieldAlt size={12} color="#10b981" />{" "}
                          {hotelDetailData.hotel.cancellationPolicy}
                        </p>
                      </div>
                    </div>

                    {hotelDetailData.hotel.houseRules &&
                      hotelDetailData.hotel.houseRules.length > 0 && (
                        <div style={{ marginTop: "12px" }}>
                          <span style={styles.infoLabel}>House Rules:</span>
                          <p
                            style={{
                              ...styles.infoVal,
                              fontStyle: "italic",
                              color: "#cbd5e1",
                            }}
                          >
                            {hotelDetailData.hotel.houseRules.join(", ")}
                          </p>
                        </div>
                      )}
                  </div>

                  {/* SECTION 3: HOTEL IMAGES GALLERY */}
                  <div style={styles.infoSection}>
                    <h4 style={styles.sectionHeaderTitle}>Property Photos</h4>
                    {!hotelDetailData.hotel.images ||
                    hotelDetailData.hotel.images.length === 0 ? (
                      <p style={styles.emptySubText}>
                        No images uploaded for this hotel.
                      </p>
                    ) : (
                      <div style={styles.galleryGrid}>
                        {hotelDetailData.hotel.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="Hotel"
                            style={styles.galleryImg}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SECTION 4: ROOMS BREAKDOWN */}
                  <div style={styles.infoSection}>
                    <h4 style={styles.sectionHeaderTitle}>
                      <FaBed color="#c4b5fd" /> Configured Rooms (
                      {hotelDetailData.hotel.rooms?.length || 0})
                    </h4>
                    {!hotelDetailData.hotel.rooms ||
                    hotelDetailData.hotel.rooms.length === 0 ? (
                      <p style={styles.emptySubText}>
                        No rooms added to this property yet.
                      </p>
                    ) : (
                      <div style={styles.roomsList}>
                        {hotelDetailData.hotel.rooms.map((room) => (
                          <div key={room._id} style={styles.roomCard}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <h5
                                style={{
                                  margin: 0,
                                  fontSize: "14px",
                                  fontWeight: 700,
                                }}
                              >
                                {room.roomType}
                              </h5>
                              <span
                                style={{ color: "#22d3ee", fontWeight: 800 }}
                              >
                                ₹{room.pricePerNight} / night
                              </span>
                            </div>
                            <p
                              style={{
                                margin: "4px 0",
                                fontSize: "12px",
                                color: "#9ca3af",
                              }}
                            >
                              Total Inventory: {room.totalRooms} rooms |
                              Capacity: {room.capacity} Guests
                            </p>
                            {room.amenities && room.amenities.length > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "6px",
                                  flexWrap: "wrap",
                                  marginTop: "6px",
                                }}
                              >
                                {room.amenities.map((am, i) => (
                                  <span key={i} style={styles.amenityTag}>
                                    {am}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SECTION 5: GUEST REVIEWS */}
                  <div style={styles.infoSection}>
                    <h4 style={styles.sectionHeaderTitle}>
                      <FaStar color="#facc15" /> Guest Reviews (
                      {hotelDetailData.reviews?.length || 0})
                    </h4>
                    {!hotelDetailData.reviews ||
                    hotelDetailData.reviews.length === 0 ? (
                      <p style={styles.emptySubText}>
                        No guest reviews posted for this hotel yet.
                      </p>
                    ) : (
                      <div style={styles.reviewsList}>
                        {hotelDetailData.reviews.map((rev) => (
                          <div key={rev._id} style={styles.reviewCard}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{ fontWeight: 700, fontSize: "13px" }}
                              >
                                {rev.userId?.name || "Guest"}
                              </span>
                              <span
                                style={{
                                  color: "#facc15",
                                  fontWeight: 700,
                                  fontSize: "12px",
                                }}
                              >
                                {rev.rating} ★
                              </span>
                            </div>
                            <p
                              style={{
                                margin: "6px 0 0 0",
                                fontSize: "12px",
                                color: "#cbd5e1",
                                fontStyle: "italic",
                              }}
                            >
                              "{rev.comment}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}

      {/* DIRECT ADD HOTEL MODAL */}
      {addModalOpen &&
        ReactDOM.createPortal(
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <h3 style={styles.modalTitle}>Direct Add Hotel</h3>
              <p style={styles.modalSubtitle}>
                Assign a new property directly to an active Hotel Admin.
              </p>
              <form
                onSubmit={handleDirectAddSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div>
                  <label style={styles.label}>Assign to Admin (Email)</label>
                  <select
                    required
                    value={formData.hotelAdminId}
                    onChange={(e) =>
                      setFormData({ ...formData, hotelAdminId: e.target.value })
                    }
                    style={styles.inputField}
                  >
                    <option value="">-- Select Hotel Admin --</option>
                    {adminUsers.map((admin) => (
                      <option key={admin._id} value={admin._id}>
                        {admin.email}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Hotel Name"
                  value={formData.hotelName}
                  onChange={(e) =>
                    setFormData({ ...formData, hotelName: e.target.value })
                  }
                  style={styles.inputField}
                />
                <input
                  type="text"
                  required
                  placeholder="Street Address"
                  value={formData.streetAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, streetAddress: e.target.value })
                  }
                  style={styles.inputField}
                />

                <div style={{ display: "flex", gap: "10px" }}>
                  <select
                    required
                    value={formData.stateId}
                    onChange={handleStateChange}
                    style={styles.inputField}
                  >
                    <option value="">State</option>
                    {statesList.map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    disabled={!formData.stateId}
                    value={formData.districtId}
                    onChange={handleDistrictChange}
                    style={styles.inputField}
                  >
                    <option value="">District</option>
                    {districtsList.map((dt) => (
                      <option key={dt._id} value={dt._id}>
                        {dt.name}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    disabled={!formData.districtId}
                    value={formData.cityId}
                    onChange={(e) =>
                      setFormData({ ...formData, cityId: e.target.value })
                    }
                    style={styles.inputField}
                  >
                    <option value="">City</option>
                    {citiesList.map((ct) => (
                      <option key={ct._id} value={ct._id}>
                        {ct.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.uploadBox}>
                  <label style={{ cursor: "pointer" }}>
                    <FaCloudUploadAlt
                      style={{
                        fontSize: "24px",
                        color: "#22d3ee",
                        display: "block",
                        margin: "0 auto 8px",
                      }}
                    />
                    <span
                      style={{
                        color: "#22d3ee",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      Select Property Photos (Max 5)
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
                        marginTop: "8px",
                        fontSize: "11px",
                        color: "#10b981",
                      }}
                    >
                      {selectedFiles.length} files selected
                    </div>
                  )}
                </div>

                <div
                  style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                >
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    style={styles.btnCancel}
                  >
                    Cancel
                  </button>
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
                      "Publish Property"
                    )}
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
  container: {
    padding: "24px",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    minHeight: "80vh",
    color: "#fff",
    animation: "fadeIn 0.3s ease",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: { fontSize: "28px", fontWeight: 800, margin: "0 0 4px 0" },
  subtitle: { color: "#9ca3af", fontSize: "14px", margin: 0 },

  tabsContainer: {
    display: "flex",
    gap: "24px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    marginBottom: "24px",
  },
  tabBtn: {
    background: "transparent",
    border: "none",
    padding: "10px 4px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },

  filterBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "24px",
    alignItems: "center",
  },
  fancySearchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    padding: "10px 14px",
    width: "100%",
    boxSizing: "border-box",
  },
  fancySearchIcon: { color: "#64748b", fontSize: "14px", marginRight: "10px" },
  fancySearchInput: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
    width: "100%",
  },
  fancySelect: {
    padding: "10px 14px",
    borderRadius: "10px",
    background: "rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#e2e8f0",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
    WebkitAppearance: "none",
    MozAppearance: "none",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%2364748b' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`,
    backgroundRepeat: "no-repeat",
    backgroundPositionX: "calc(100% - 10px)",
    backgroundPositionY: "center",
    paddingRight: "30px",
  },

  btnDirectAdd: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  iconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "rgba(59, 130, 246, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statusPill: (status) => ({
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: 800,
    textTransform: "uppercase",
    background:
      status === "approved"
        ? "rgba(34,197,94,0.15)"
        : status === "rejected"
          ? "rgba(239,68,68,0.15)"
          : "rgba(245,158,11,0.15)",
    color:
      status === "approved"
        ? "#86efac"
        : status === "rejected"
          ? "#fca5a5"
          : "#fde047",
    border: `1px solid ${status === "approved" ? "rgba(34,197,94,0.3)" : status === "rejected" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
  }),

  hotelName: { margin: "0 0 8px 0", fontSize: "18px", fontWeight: 800 },
  detailText: {
    margin: "0 0 4px 0",
    fontSize: "12px",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  ownerBox: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  ownerTitle: {
    margin: "0 0 6px 0",
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
  },

  rejectionBox: {
    marginTop: "12px",
    padding: "10px",
    background: "rgba(239, 68, 68, 0.05)",
    borderLeft: "2px solid #ef4444",
    borderRadius: "0 8px 8px 0",
  },

  actionsBox: { display: "flex", gap: "10px", marginTop: "auto" },
  btnViewDetails: {
    flex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    background: "rgba(34, 211, 238, 0.1)",
    border: "1px solid rgba(34, 211, 238, 0.3)",
    color: "#22d3ee",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12px",
  },
  btnApprove: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    color: "#86efac",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12px",
  },
  btnReject: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    color: "#fca5a5",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12px",
  },

  paginationMini: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    alignItems: "center",
    marginTop: "32px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    paddingTop: "20px",
  },
  pageBtnMini: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  loaderBox: { padding: "60px", display: "flex", justifyContent: "center" },
  emptyBox: {
    padding: "60px",
    textAlign: "center",
    color: "#6b7280",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "16px",
    border: "1px dashed rgba(255,255,255,0.1)",
  },

  // --- DETAILS MODAL STYLES ---
  detailsModalCard: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "800px",
    padding: "28px",
    margin: "auto",
    maxHeight: "90vh",
    overflowY: "auto",
    color: "#fff",
  },
  detailsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    paddingBottom: "16px",
  },
  detailsTitle: { margin: "0 0 8px 0", fontSize: "24px", fontWeight: 800 },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    padding: "4px",
  },

  detailsBody: { display: "flex", flexDirection: "column", gap: "20px" },
  infoSection: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "14px",
    padding: "16px",
  },
  sectionHeaderTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#e2e8f0",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },
  infoLabel: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  infoVal: {
    margin: "2px 0 0 0",
    fontSize: "13px",
    fontWeight: 600,
    color: "#f8fafc",
  },

  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
    gap: "10px",
  },
  galleryImg: {
    width: "100%",
    height: "80px",
    objectFit: "cover",
    borderRadius: "8px",
  },

  roomsList: { display: "flex", flexDirection: "column", gap: "10px" },
  roomCard: {
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "12px",
    borderRadius: "10px",
  },
  amenityTag: {
    background: "rgba(34,211,238,0.1)",
    color: "#22d3ee",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: 700,
  },

  reviewsList: { display: "flex", flexDirection: "column", gap: "8px" },
  reviewCard: {
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "12px",
    borderRadius: "10px",
  },
  emptySubText: {
    color: "#64748b",
    fontSize: "12px",
    fontStyle: "italic",
    margin: 0,
  },

  // --- DIRECT ADD MODAL STYLES ---
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.85)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "16px",
    boxSizing: "border-box",
  },
  modalCard: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "18px",
    width: "100%",
    maxWidth: "500px",
    padding: "24px",
    margin: "auto",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: 700,
    margin: "0 0 4px 0",
    color: "#fff",
  },
  modalSubtitle: { fontSize: "12px", color: "#9ca3af", margin: "0 0 16px 0" },
  label: {
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: "4px",
    display: "block",
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
    fontSize: "13px",
  },
  uploadBox: {
    border: "1px dashed rgba(34, 211, 238, 0.4)",
    borderRadius: "10px",
    padding: "16px",
    textAlign: "center",
    background: "rgba(34, 211, 238, 0.03)",
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
};
