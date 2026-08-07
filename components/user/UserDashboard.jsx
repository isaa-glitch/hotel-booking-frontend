import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import gsap from "gsap";
import moment from "moment";
import {
  FaMapMarkerAlt,
  FaBed,
  FaSearch,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";

// Dedicated Views & Modals
import PublicHotelDetailsView from "./PublicHotelDetailsView";
import PublicRoomDetailsModal from "./PublicRoomDetailsModal";
import CheckoutView from "./CheckoutView";
import UserBookingDetailsModal from "./UserBookingDetails";
import UserOverview from "./UserOverview";
import useSearch from "./../../hooks/useSearch"; // <-- Universal Search Hook

const POPULAR_AMENITIES = [
  "Free WiFi",
  "AC",
  "TV",
  "Mini Bar",
  "Bathtub",
  "Balcony",
  "Ocean View",
];

function UserDashboard() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const viewRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeView, setActiveView] = useState("overview");

  // Use the Universal Hook pointing directly to your hotel search endpoint
  const {
    filters,
    updateFilter,
    data: hotels,
    paginationMeta,
    loading,
  } = useSearch("/api/hotels/search", {
    stateId: "",
    cityId: "",
    amenities: [],
    keyword: "",
    sortBy: "newest",
    page: 1,
    limit: 10,
  });

  const [myBookings, setMyBookings] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [activeHoldData, setActiveHoldData] = useState(null);
  const [checkoutStart, setCheckoutStart] = useState("");
  const [checkoutEnd, setCheckoutEnd] = useState("");

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const role =
          localStorage.getItem("role") ||
          storedUser.role ||
          decodedPayload.role ||
          "user";

        setCurrentUser({
          email: decodedPayload.email || storedUser.email || "user@gmail.com",
          role: role,
          name: decodedPayload.email
            ? decodedPayload.email.split("@")[0]
            : storedUser.name || "User",
        });
      } catch (e) {
        setCurrentUser({ email: "User", role: "user" });
      }
    }

    fetchStates();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (viewRef.current) {
      gsap.fromTo(
        viewRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      );
    }
  }, [activeView]);

  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    setIsProfileOpen(false);
    setActiveView("search");
    navigate("/login");
  };

  const fetchStates = async () => {
    try {
      const res = await axios.get("/api/states/allState");
      setStatesList(res.data.data || []);
    } catch (err) {}
  };

  const fetchMyBookings = async () => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const role =
      localStorage.getItem("role") || storedUser.role || storedUser.user?.role;

    if (!token) {
      alert("Please log in to view your bookings.");
      return navigate("/login");
    }

    if (role && String(role).toLowerCase() !== "user") {
      alert(
        "Admins do not have a booking history. Please log in as a Customer.",
      );
      return navigate("/login");
    }

    try {
      const res = await axios.get("/api/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyBookings(res.data.data || []);
      setActiveView("bookings");
    } catch (err) {
      console.error(err);
    }
  };

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    updateFilter("stateId", stateId);
    updateFilter("cityId", "");
    if (stateId) {
      try {
        const res = await axios.get(`/api/cities/allCity?stateId=${stateId}`);
        setCitiesList(res.data.data || []);
      } catch (err) {}
    } else {
      setCitiesList([]);
    }
  };

  const handleAmenityToggle = (amenity) => {
    const currentAmenities = filters.amenities || [];
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];

    updateFilter("amenities", updatedAmenities);
  };

  const getStartingPrice = (rooms) => {
    if (!rooms || rooms.length === 0) return "N/A";
    return `₹${Math.min(...rooms.map((r) => r.pricePerNight))}`;
  };

  return (
    <div style={styles.wrapper}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h1
          style={{ ...styles.logo, cursor: "pointer" }}
          onClick={() => setActiveView("overview")}
        >
          TRAVEL<span style={{ color: "#22d3ee" }}>EASE</span>
        </h1>

        <div style={styles.navLinks}>
          <button
            onClick={() => setActiveView("overview")}
            style={{
              ...styles.textBtn,
              color: activeView === "overview" ? "#22d3ee" : "#9ca3af",
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView("search")}
            style={{
              ...styles.textBtn,
              color: activeView === "search" ? "#22d3ee" : "#9ca3af",
            }}
          >
            Find Hotels
          </button>
          <button
            onClick={fetchMyBookings}
            style={{
              ...styles.textBtn,
              color: activeView === "bookings" ? "#22d3ee" : "#9ca3af",
            }}
          >
            My Bookings
          </button>
          <span style={styles.divider}>|</span>

          {currentUser ? (
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={styles.profileBtn}
              >
                <FaUserCircle size={16} /> <span>{currentUser.name}</span>{" "}
                <FaChevronDown size={10} />
              </button>
              {isProfileOpen && (
                <div style={styles.dropdownMenu}>
                  <div style={styles.dropdownHeader}>
                    <p style={styles.dropdownName}>{currentUser.name}</p>
                    <p style={styles.dropdownEmail}>{currentUser.email}</p>
                  </div>
                  <div style={styles.dropdownDivider} />
                  <button onClick={handleLogout} style={styles.logoutBtn}>
                    <FaSignOutAlt /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => navigate("/login")} style={styles.textBtn}>
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                style={styles.signUpBtn}
              >
                Sign Up Free
              </button>
            </>
          )}
        </div>
      </nav>

      <div ref={viewRef} style={styles.viewContainer}>
        {activeView === "overview" && (
          <div style={styles.mainLayout}>
            <div style={{ width: "100%" }}>
              <UserOverview
                onSwitchToBookings={() => fetchMyBookings()}
                onSwitchToFindHotel={() => setActiveView("search")}
              />
            </div>
          </div>
        )}

        {activeView === "search" && (
          <div style={styles.mainLayout}>
            <aside style={styles.sidebar}>
              <h3 style={styles.filterTitle}>Refine Your Search</h3>

              {/* KEYWORD SEARCH INPUT */}
              <div style={styles.filterGroup}>
                <label style={styles.label}>Search Hotel Name</label>
                <input
                  type="text"
                  placeholder="e.g., Grand Palace..."
                  value={filters.keyword || ""}
                  onChange={(e) => updateFilter("keyword", e.target.value)}
                  style={styles.input}
                />
              </div>

              {/* SORTING DROPDOWN */}
              <div style={styles.filterGroup}>
                <label style={styles.label}>Sort By</label>
                <select
                  value={filters.sortBy || "newest"}
                  onChange={(e) => updateFilter("sortBy", e.target.value)}
                  style={styles.input}
                >
                  <option value="newest">Newest First</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>Select State</label>
                <select
                  value={filters.stateId || ""}
                  onChange={handleStateChange}
                  style={styles.input}
                >
                  <option value="">All States</option>
                  {statesList.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>Select City</label>
                <select
                  disabled={!filters.stateId}
                  value={filters.cityId || ""}
                  onChange={(e) => updateFilter("cityId", e.target.value)}
                  style={styles.input}
                >
                  <option value="">All Cities</option>
                  {citiesList.map((ct) => (
                    <option key={ct._id} value={ct._id}>
                      {ct.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.label}>Must-Have Amenities</label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {POPULAR_AMENITIES.map((amenity) => (
                    <label
                      key={amenity}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        color: "#d1d5db",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={(filters.amenities || []).includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        style={{
                          accentColor: "#22d3ee",
                          cursor: "pointer",
                          width: "16px",
                          height: "16px",
                        }}
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            <main style={styles.contentArea}>
              <div style={styles.resultsHeader}>
                <h2 style={styles.resultsTitle}>Explore Top Properties</h2>
                <p style={styles.resultsSub}>
                  {paginationMeta.total || hotels.length} verified properties
                  available
                </p>
              </div>

              {loading ? (
                <div style={styles.loaderBox}>
                  <ClipLoader color="#22d3ee" size={40} />
                </div>
              ) : hotels.length === 0 ? (
                <div style={styles.emptyBox}>
                  <h3>No hotels found matching your criteria.</h3>
                </div>
              ) : (
                <>
                  <div style={styles.grid}>
                    {hotels.map((hotel) => (
                      <div key={hotel._id} style={styles.hotelCard}>
                        <div style={styles.imageBox}>
                          {hotel.images?.[0] ? (
                            <img
                              src={hotel.images[0]}
                              alt="Hotel"
                              style={styles.img}
                            />
                          ) : (
                            <div style={styles.noImg}>No Image</div>
                          )}
                          <span style={styles.priceBadge}>
                            Starts at {getStartingPrice(hotel.rooms)}
                          </span>
                        </div>
                        <div style={styles.cardBody}>
                          <h3 style={styles.hotelName}>{hotel.hotelName}</h3>
                          <p style={styles.address}>
                            <FaMapMarkerAlt style={{ color: "#f87171" }} />{" "}
                            {hotel.streetAddress}
                          </p>
                          <button
                            onClick={() => {
                              setSelectedHotel(hotel);
                              setActiveView("hotel");
                            }}
                            style={styles.bookBtn}
                          >
                            View Hotel Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* UNIVERSAL PAGINATION CONTROLS BAR */}
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
                        disabled={
                          filters.page >= (paginationMeta.totalPages || 1)
                        }
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
            </main>
          </div>
        )}

        {activeView === "hotel" && selectedHotel && (
          <PublicHotelDetailsView
            hotel={selectedHotel}
            onBack={() => setActiveView("search")}
            onRoomSelect={(room) => {
              setSelectedRoom(room);
              setActiveView("room");
            }}
          />
        )}

        {activeView === "room" && selectedRoom && selectedHotel && (
          <PublicRoomDetailsModal
            room={selectedRoom}
            hotel={selectedHotel}
            onBack={() => setActiveView("hotel")}
            onProceedToCheckout={(holdData, startStr, endStr) => {
              setActiveHoldData(holdData);
              setCheckoutStart(startStr);
              setCheckoutEnd(endStr);
              setActiveView("checkout");
            }}
          />
        )}

        {activeView === "checkout" && selectedHotel && selectedRoom && (
          <CheckoutView
            hotel={selectedHotel}
            room={selectedRoom}
            holdData={activeHoldData}
            initialStart={checkoutStart}
            initialEnd={checkoutEnd}
            onBack={() => setActiveView("room")}
            onSuccess={() => {
              setActiveHoldData(null);
              fetchMyBookings();
            }}
          />
        )}

        {activeView === "bookings" && (
          <div style={styles.bookingsLayout}>
            <div style={styles.resultsHeader}>
              <h2 style={styles.resultsTitle}>My Bookings</h2>
              <p style={styles.resultsSub}>
                Manage your reservations and view QR itineraries.
              </p>
            </div>
            {loading ? (
              <div style={styles.loaderBox}>
                <ClipLoader color="#22d3ee" size={40} />
              </div>
            ) : myBookings.length === 0 ? (
              <div style={styles.emptyBox}>
                <h3>No bookings yet!</h3>
              </div>
            ) : (
              <div style={styles.bookingsList}>
                {myBookings.map((b) => (
                  <div
                    key={b._id}
                    style={styles.bookingCard}
                    onClick={() => setSelectedBookingId(b._id)}
                  >
                    <div>
                      <h3 style={styles.hotelName}>
                        {b.hotelId?.hotelName || "Hotel Unavailable"}
                      </h3>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#9ca3af",
                          margin: 0,
                        }}
                      >
                        {moment(b.startDate).format("MMM Do, YYYY")} -{" "}
                        {moment(b.endDate).format("MMM Do, YYYY")}
                      </p>
                      <h4 style={{ color: "#facc15", margin: "8px 0 0 0" }}>
                        Total: ₹{b.price}
                      </h4>
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          ...styles.statusBadge,
                          color:
                            b.status === "completed" || b.status === "approved"
                              ? "#86efac"
                              : "#fca5a5",
                        }}
                      >
                        {b.status}
                      </span>

                      {b.status === "completed" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewBookingId(b._id);
                            setReviewModalOpen(true);
                          }}
                          style={{
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          ★ Leave Review
                        </button>
                      ) : (
                        <p
                          style={{
                            fontSize: "10px",
                            color: "#9ca3af",
                            margin: 0,
                          }}
                        >
                          Click for itinerary
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <UserBookingDetailsModal
        isOpen={!!selectedBookingId}
        bookingId={selectedBookingId}
        onClose={() => setSelectedBookingId(null)}
      />

      <ReviewModal
        isOpen={reviewModalOpen}
        bookingId={reviewBookingId}
        onClose={() => {
          setReviewModalOpen(false);
          setReviewBookingId(null);
        }}
      />
    </div>
  );
}

function ReviewModal({ isOpen, onClose, bookingId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/reviews/create",
        { bookingId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Thanks for your review!");
      setComment("");
      setRating(5);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting review");
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
      }}
    >
      <div
        style={{
          background: "#0f172a",
          padding: "32px",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "400px",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: "22px" }}>
          Rate Your Stay
        </h2>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            color: "#9ca3af",
            marginBottom: "8px",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Select Rating
        </label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            background: "#1e293b",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          <option value={5}>⭐⭐⭐⭐⭐ - Excellent</option>
          <option value={4}>⭐⭐⭐⭐ - Good</option>
          <option value={3}>⭐⭐⭐ - Average</option>
          <option value={2}>⭐⭐ - Poor</option>
          <option value={1}>⭐ - Terrible</option>
        </select>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            color: "#9ca3af",
            marginBottom: "8px",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Your Feedback
        </label>
        <textarea
          placeholder="Tell us what you loved..."
          rows="4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            background: "#1e293b",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            boxSizing: "border-box",
            marginBottom: "24px",
            fontSize: "14px",
          }}
        ></textarea>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "14px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              flex: 1,
              padding: "14px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              border: "none",
              color: "#fff",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#0a0a0f",
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 48px",
    background: "rgba(15, 23, 42, 0.9)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(10px)",
  },
  logo: { margin: 0, fontSize: "22px", fontWeight: 900, letterSpacing: "1px" },
  navLinks: { display: "flex", alignItems: "center", gap: "16px" },
  divider: {
    color: "rgba(255,255,255,0.2)",
    fontSize: "18px",
    margin: "0 4px",
  },
  textBtn: {
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  signUpBtn: {
    background: "#2563eb",
    border: "none",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "20px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "13px",
  },
  profileBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "20px",
    fontWeight: 600,
    fontSize: "13px",
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
  viewContainer: { width: "100%" },
  mainLayout: {
    display: "flex",
    padding: "32px 48px",
    gap: "32px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  sidebar: {
    width: "280px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "24px",
    height: "fit-content",
    position: "sticky",
    top: "100px",
  },
  filterTitle: {
    fontSize: "18px",
    fontWeight: 700,
    margin: "0 0 20px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    paddingBottom: "12px",
  },
  filterGroup: { marginBottom: "20px" },
  label: {
    display: "block",
    fontSize: "12px",
    color: "#9ca3af",
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },
  contentArea: { flex: 1 },
  resultsHeader: { marginBottom: "24px" },
  resultsTitle: { fontSize: "28px", fontWeight: 800, margin: "0 0 4px 0" },
  resultsSub: { color: "#9ca3af", margin: 0, fontSize: "14px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
  },
  hotelCard: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  imageBox: { height: "200px", background: "#1e293b", position: "relative" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
  },
  priceBadge: {
    position: "absolute",
    bottom: "12px",
    right: "12px",
    background: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(4px)",
    color: "#facc15",
    padding: "6px 12px",
    borderRadius: "8px",
    fontWeight: 800,
    fontSize: "13px",
  },
  cardBody: { padding: "20px" },
  hotelName: { fontSize: "18px", fontWeight: 700, margin: "0 0 8px 0" },
  address: {
    fontSize: "12px",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "16px",
  },
  bookBtn: {
    width: "100%",
    padding: "10px",
    background: "rgba(34, 211, 238, 0.15)",
    border: "1px solid rgba(34, 211, 238, 0.4)",
    color: "#67e8f9",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
  },
  loaderBox: { display: "flex", justifyContent: "center", padding: "60px 0" },
  emptyBox: {
    textAlign: "center",
    padding: "60px",
    background: "rgba(255,255,255,0.02)",
    border: "1px dashed rgba(255,255,255,0.1)",
    borderRadius: "16px",
    color: "#9ca3af",
  },
  bookingsLayout: {
    maxWidth: "1000px",
    margin: "40px auto",
    padding: "0 20px",
  },
  bookingsList: { display: "flex", flexDirection: "column", gap: "16px" },
  bookingCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "20px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  // Pagination Bar Styles
  paginationBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "32px",
    padding: "16px 20px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
  },
  limitBox: { display: "flex", alignItems: "center", gap: "10px" },
  navBox: { display: "flex", gap: "12px", alignItems: "center" },
  paginationText: { fontSize: "13px", color: "#9ca3af", fontWeight: 600 },
  limitSelect: {
    background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "8px",
    outline: "none",
    cursor: "pointer",
  },
  pageBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12px",
    transition: "background 0.2s",
  },
};

export default UserDashboard;
