import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaCalendarCheck,
  FaEllipsisV,
  FaTrash,
} from "react-icons/fa";
import gsap from "gsap";

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

export default function SingleHotelDashboard({ hotel, onBack }) {
  const [bookings, setBookings] = useState([]);
  const [allDates, setAllDates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filtering & Pagination State
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dropdown Menu State
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Close dropdown when clicking anywhere outside
  useEffect(() => {
    const closeMenu = () => setActiveDropdown(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHotelBookings();
    }, 400);
    return () => clearTimeout(timer);
  }, [hotel._id, page, search, sort, fromDate, toDate]);

  const fetchHotelBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const query = `?page=${page}&search=${search}&sort=${sort}&fromDate=${fromDate}&toDate=${toDate}`;
      const res = await axios.get(
        `/api/bookings/admin-hotel/${hotel._id}${query}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBookings(res.data.data || []);
      setAllDates(res.data.allDates || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    let endpoint = "";
    let payload = {};
    let method = "patch"; // default

    if (action === "approve") {
      if (
        !window.confirm(
          "Approve this booking? A confirmation email will be sent to the guest.",
        )
      )
        return;
      endpoint = `approve/${id}`;
    } else if (action === "reject") {
      const reason = window.prompt(
        "Please provide a reason for cancellation (This will be emailed directly to the guest):",
      );
      if (reason === null) return;
      endpoint = `cancel/${id}`; // Fixed: Swapped to 'cancel' to match backend
      payload = { reason };
    } else if (action === "complete") {
      if (
        !window.confirm(
          "Mark this stay as completed? A thank-you email will be sent requesting a review.",
        )
      )
        return;
      endpoint = `complete/${id}`;
      method = "put"; // Based on standard REST structure
    } else if (action === "delete") {
      if (
        !window.confirm(
          "WARNING: Are you sure you want to permanently delete this booking? This action cannot be undone.",
        )
      )
        return;
      endpoint = `delete/${id}`; // NOTE: You need a backend route for this!
      method = "delete";
    }

    try {
      const token = localStorage.getItem("token");
      await axios({
        method: method,
        url: `/api/bookings/${endpoint}`,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchHotelBookings();
    } catch (err) {
      alert(
        `Error trying to ${action} booking: ` +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const pendingCount = allDates.filter((b) => b.status === "pending").length;
  const approvedCount = allDates.filter((b) => b.status === "approved").length;

  // --- Calendar Rendering Logic ---
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const changeMonth = (offset) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1),
    );
  };

  const getDayStatus = (day) => {
    const targetTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    ).getTime();
    let hasPending = false;
    let hasApproved = false;

    allDates.forEach((b) => {
      const start = new Date(b.startDate).setHours(0, 0, 0, 0);
      const end = new Date(b.endDate).setHours(0, 0, 0, 0);
      if (targetTime >= start && targetTime <= end) {
        if (b.status === "approved" || b.status === "completed")
          hasApproved = true;
        else if (b.status === "pending") hasPending = true;
      }
    });

    if (hasApproved) return "booked";
    if (hasPending) return "pending";
    return "available";
  };

  const renderCalendarDays = () => {
    const cells = [];
    const todayStr = new Date().toDateString();

    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(
        <div key={`empty-${i}`} style={styles.calendarCellEmpty}></div>,
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const status = getDayStatus(day);
      const isToday =
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day,
        ).toDateString() === todayStr;

      let cellStyle = { ...styles.calendarCell };
      if (status === "booked") cellStyle.background = "rgba(16, 185, 129, 0.2)";
      else if (status === "pending")
        cellStyle.background = "rgba(245, 158, 11, 0.2)";
      else cellStyle.background = "rgba(255, 255, 255, 0.03)";

      cells.push(
        <div
          key={`day-${day}`}
          style={{
            ...cellStyle,
            border: isToday
              ? "1px solid #22d3ee"
              : "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span
            style={{
              ...styles.dayNumber,
              color:
                status === "booked"
                  ? "#10b981"
                  : status === "pending"
                    ? "#fcd34d"
                    : "#e2e8f0",
              fontWeight: isToday ? 800 : 500,
            }}
          >
            {day}
          </span>
        </div>,
      );
    }
    return cells;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>
          <FaArrowLeft /> Back to Properties
        </button>
        <div style={styles.titleArea}>
          <h2 style={styles.title}>{hotel.hotelName}</h2>
          <p style={styles.address}>
            <FaMapMarkerAlt style={{ color: "#f87171" }} />{" "}
            {hotel.streetAddress}
          </p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Pending Requests</div>
          <div style={{ ...styles.statValue, color: "#facc15" }}>
            {pendingCount}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Confirmed Stays</div>
          <div style={{ ...styles.statValue, color: "#10b981" }}>
            {approvedCount}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Room Types</div>
          <div style={{ ...styles.statValue, color: "#c4b5fd" }}>
            {hotel.rooms?.length || 0}
          </div>
        </div>
      </div>

      <div style={styles.twoColumnLayout}>
        <div
          style={{
            ...styles.cardBase,
            flex: 1,
            minWidth: "300px",
            height: "fit-content",
          }}
        >
          <div style={styles.cardHeaderFlex}>
            <h3 style={styles.cardTitle}>
              <FaCalendarAlt style={{ color: "#8b5cf6", marginRight: "8px" }} />{" "}
              Availability
            </h3>
            <div style={styles.calControls}>
              <button onClick={() => changeMonth(-1)} style={styles.calBtn}>
                <FaChevronLeft size={10} />
              </button>
              <span style={styles.calMonthText}>
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button onClick={() => changeMonth(1)} style={styles.calBtn}>
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>
          <div style={styles.calendarGrid}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} style={styles.calDayHeader}>
                {day}
              </div>
            ))}
            {renderCalendarDays()}
          </div>
          <div style={styles.legendContainer}>
            <div style={styles.legendItem}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              ></div>
              <span>Available</span>
            </div>
            <div style={styles.legendItem}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: "rgba(245, 158, 11, 0.3)",
                }}
              ></div>
              <span>Pending</span>
            </div>
            <div style={styles.legendItem}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: "rgba(16, 185, 129, 0.3)",
                }}
              ></div>
              <span>Booked</span>
            </div>
          </div>
        </div>

        <div style={{ ...styles.cardBase, flex: 2, minWidth: "400px" }}>
          <div style={styles.cardHeaderFlex}>
            <h3 style={styles.cardTitle}>
              <FaCalendarAlt style={{ color: "#3b82f6", marginRight: "8px" }} />{" "}
              Reservation History
            </h3>
          </div>

          <div style={styles.filterBar}>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <AnimatedSearch
                placeholder="Search guest email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <AnimatedSelect
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
                { value: "price-high", label: "Price (High-Low)" },
                { value: "price-low", label: "Price (Low-High)" },
              ]}
            />
            <div style={styles.datePickerGroup}>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                style={styles.dateInput}
                title="From Date"
              />
              <span style={{ color: "#64748b" }}>-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                style={styles.dateInput}
                title="To Date"
              />
            </div>
          </div>

          {loading ? (
            <div style={styles.loaderBox}>
              <ClipLoader color="#22d3ee" />
            </div>
          ) : bookings.length === 0 ? (
            <div style={styles.emptyText}>No bookings match your filters.</div>
          ) : (
            <>
              {/* Added paddingBottom so the dropdown menu doesn't get clipped by overflow */}
              <div style={{ overflowX: "auto", paddingBottom: "100px" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>GUEST</th>
                      <th style={styles.th}>DATES</th>
                      <th style={styles.th}>PRICE</th>
                      <th style={styles.th}>STATUS</th>
                      <th
                        style={{
                          ...styles.th,
                          textAlign: "right",
                          paddingRight: "20px",
                        }}
                      >
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b._id} style={styles.tr}>
                        <td style={styles.tdBold}>
                          {b.userId?.name || "User"} <br />
                          <small style={{ color: "#9ca3af", fontWeight: 400 }}>
                            {b.userId?.email}
                          </small>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: "11px" }}>
                            In: {new Date(b.startDate).toLocaleDateString()}{" "}
                            <br />
                            Out: {new Date(b.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={styles.tdBold}>₹{b.price}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusPill,
                              background:
                                b.status === "approved" ||
                                b.status === "completed"
                                  ? "rgba(34,197,94,0.15)"
                                  : b.status === "cancelled"
                                    ? "rgba(239,68,68,0.15)"
                                    : "rgba(234,179,8,0.15)",
                              color:
                                b.status === "approved" ||
                                b.status === "completed"
                                  ? "#86efac"
                                  : b.status === "cancelled"
                                    ? "#fca5a5"
                                    : "#fde047",
                              border: `1px solid ${b.status === "approved" || b.status === "completed" ? "rgba(34,197,94,0.4)" : b.status === "cancelled" ? "rgba(239,68,68,0.4)" : "rgba(234,179,8,0.4)"}`,
                            }}
                          >
                            {b.status}
                          </span>
                        </td>

                        {/* --- NEW DROPDOWN ACTIONS COLUMN --- */}
                        <td
                          style={{
                            ...styles.td,
                            textAlign: "right",
                            position: "relative",
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(
                                activeDropdown === b._id ? null : b._id,
                              );
                            }}
                            style={styles.ellipsisBtn}
                          >
                            <FaEllipsisV />
                          </button>

                          {activeDropdown === b._id && (
                            <div
                              style={styles.dropdownMenu}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {b.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => {
                                      handleAction(b._id, "approve");
                                      setActiveDropdown(null);
                                    }}
                                    style={styles.dropdownItem}
                                  >
                                    <FaCheck color="#10b981" /> Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleAction(b._id, "reject");
                                      setActiveDropdown(null);
                                    }}
                                    style={styles.dropdownItem}
                                  >
                                    <FaTimes color="#f59e0b" /> Reject
                                  </button>
                                </>
                              )}

                              {b.status === "approved" && (
                                <>
                                  <button
                                    onClick={() => {
                                      handleAction(b._id, "complete");
                                      setActiveDropdown(null);
                                    }}
                                    style={styles.dropdownItem}
                                  >
                                    <FaCalendarCheck color="#22d3ee" /> Mark
                                    Completed
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleAction(b._id, "reject");
                                      setActiveDropdown(null);
                                    }}
                                    style={styles.dropdownItem}
                                  >
                                    <FaTimes color="#f59e0b" /> Cancel Booking
                                  </button>
                                </>
                              )}

                              {/* Delete is available for all statuses */}
                              <div style={styles.dropdownDivider}></div>
                              <button
                                onClick={() => {
                                  handleAction(b._id, "delete");
                                  setActiveDropdown(null);
                                }}
                                style={{
                                  ...styles.dropdownItem,
                                  color: "#fca5a5",
                                }}
                              >
                                <FaTrash color="#ef4444" /> Delete Record
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={styles.paginationMini}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  style={styles.pageBtnMini}
                >
                  Prev
                </button>
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  style={styles.pageBtnMini}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    color: "#fff",
    animation: "fadeIn 0.4s ease-out",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
  },
  backBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 600,
  },
  titleArea: { flex: 1 },
  title: { fontSize: "28px", fontWeight: 800, margin: "0 0 4px 0" },
  address: {
    fontSize: "13px",
    color: "#9ca3af",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#9ca3af",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  statValue: { fontSize: "28px", fontWeight: 800 },

  twoColumnLayout: { display: "flex", flexWrap: "wrap", gap: "24px" },
  cardBase: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
  },
  cardHeaderFlex: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  cardTitle: { margin: "0", fontSize: "18px" },

  filterBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "16px",
    alignItems: "center",
  },
  fancySearchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    padding: "8px 12px",
    width: "100%",
    boxSizing: "border-box",
  },
  fancySearchIcon: { color: "#64748b", fontSize: "12px", marginRight: "8px" },
  fancySearchInput: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "12px",
    outline: "none",
    width: "100%",
  },
  fancySelect: {
    padding: "8px 12px",
    borderRadius: "10px",
    background: "rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#e2e8f0",
    fontSize: "12px",
    outline: "none",
    cursor: "pointer",
    WebkitAppearance: "none",
    MozAppearance: "none",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%2364748b' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`,
    backgroundRepeat: "no-repeat",
    backgroundPositionX: "calc(100% - 8px)",
    backgroundPositionY: "center",
    paddingRight: "28px",
  },
  datePickerGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    padding: "4px 8px",
  },
  dateInput: {
    background: "transparent",
    border: "none",
    color: "#e2e8f0",
    outline: "none",
    fontSize: "12px",
    cursor: "pointer",
    colorScheme: "dark",
  },

  calControls: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(0,0,0,0.3)",
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  calBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
  },
  calMonthText: {
    fontSize: "13px",
    fontWeight: 700,
    minWidth: "110px",
    textAlign: "center",
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "6px",
  },
  calDayHeader: {
    textAlign: "center",
    fontSize: "11px",
    color: "#64748b",
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  calendarCell: {
    aspectRatio: "1",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarCellEmpty: { aspectRatio: "1" },
  dayNumber: { fontSize: "12px" },
  legendContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: 600,
  },

  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: {
    color: "#6b7280",
    fontSize: "11px",
    fontWeight: 700,
    padding: "12px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
    textTransform: "uppercase",
  },
  tr: { borderBottom: "1px solid rgba(255, 255, 255, 0.04)" },
  tdBold: { padding: "12px", color: "#fff", fontWeight: 600, fontSize: "13px" },
  td: { padding: "12px", color: "#d1d5db", fontSize: "13px" },
  statusPill: {
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
  },

  // --- NEW DROPDOWN MENU STYLES ---
  ellipsisBtn: {
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  dropdownMenu: {
    position: "absolute",
    right: "20px",
    top: "40px",
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
    zIndex: 50,
    minWidth: "180px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  dropdownItem: {
    background: "transparent",
    border: "none",
    color: "#e2e8f0",
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
  },
  dropdownDivider: {
    height: "1px",
    background: "rgba(255,255,255,0.05)",
    margin: "4px 0",
  },

  paginationMini: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "16px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    paddingTop: "12px",
  },
  pageBtnMini: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: 700,
    cursor: "pointer",
  },
  loaderBox: { padding: "40px", display: "flex", justifyContent: "center" },
  emptyText: { padding: "40px", textAlign: "center", color: "#6b7280" },
};
