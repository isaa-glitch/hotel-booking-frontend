import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import {
  FaWallet,
  FaBed,
  FaClock,
  FaStar,
  FaBuilding,
  FaUserCircle,
  FaSearch,
} from "react-icons/fa";
import gsap from "gsap";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  YAxis,
  CartesianGrid,
} from "recharts";

const PIE_COLORS = ["#10b981", "#f59e0b"];

// ==========================================
// Animated Search Input
// ==========================================
const AnimatedSearch = ({ value, onChange, placeholder }) => {
  const wrapperRef = useRef(null);

  const handleFocus = () => {
    gsap.to(wrapperRef.current, {
      scale: 1.02,
      borderColor: "rgba(34, 211, 238, 0.5)",
      boxShadow: "0 0 12px rgba(34, 211, 238, 0.15)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleBlur = () => {
    gsap.to(wrapperRef.current, {
      scale: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
      boxShadow: "none",
      duration: 0.3,
      ease: "power2.out",
    });
  };

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

// ==========================================
// Animated Select Dropdown
// ==========================================
const AnimatedSelect = ({ value, onChange, options }) => {
  const selectRef = useRef(null);

  const handleFocus = () => {
    gsap.to(selectRef.current, {
      scale: 1.02,
      borderColor: "rgba(34, 211, 238, 0.5)",
      duration: 0.3,
    });
  };

  const handleBlur = () => {
    gsap.to(selectRef.current, {
      scale: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
      duration: 0.3,
    });
  };

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

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
export default function HotelAdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  // --- STATE: REVENUE CHART ---
  const [revenueRange, setRevenueRange] = useState("7d");

  // --- STATE: BOOKINGS ---
  const [bSearch, setBSearch] = useState("");
  const [bSort, setBSort] = useState("newest");
  const [bPage, setBPage] = useState(1);

  // --- STATE: PROPERTIES ---
  const [pSearch, setPSearch] = useState("");
  const [pSort, setPSort] = useState("a-z");
  const [pPage, setPPage] = useState(1);

  // --- STATE: REVIEWS ---
  const [rSearch, setRSearch] = useState("");
  const [rSort, setRSort] = useState("newest");
  const [rPage, setRPage] = useState(1);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 400);
    return () => clearTimeout(timer);
  }, [
    revenueRange,
    bSearch,
    bSort,
    bPage,
    pSearch,
    pSort,
    pPage,
    rSearch,
    rSort,
    rPage,
  ]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const query = `?revenueRange=${revenueRange}&bPage=${bPage}&bSearch=${bSearch}&bSort=${bSort}&pPage=${pPage}&pSearch=${pSearch}&pSort=${pSort}&rPage=${rPage}&rSearch=${rSearch}&rSort=${rSort}`;

      const res = await axios.get(`/api/dashboard/hotel-admin${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "100px" }}
      >
        <ClipLoader color="#22d3ee" size={50} />
      </div>
    );
  }

  const currentRevenue = data?.stats?.totalRevenue || 0;
  const approvedBookings =
    (data?.stats?.totalBookings || 0) - (data?.stats?.pendingRequests || 0);
  const bookingPieData = [
    {
      name: "Approved / Completed",
      value: approvedBookings > 0 ? approvedBookings : 0,
    },
    {
      name: "Pending",
      value: data?.stats?.pendingRequests > 0 ? data.stats.pendingRequests : 0,
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.customTooltip}>
          <p style={styles.tooltipLabel}>{label}</p>
          <p style={{ margin: "4px 0", color: "#22d3ee", fontWeight: 700 }}>
            Revenue: ₹{payload[0].value}
          </p>
          <p style={{ margin: 0, color: "#9ca3af", fontSize: "12px" }}>
            Bookings: {payload[0].payload.bookings}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={containerRef} style={styles.container}>
      {/* TOP ROW: QUICK STATS */}
      <div style={styles.gridTop}>
        <div
          className="ha-card"
          style={{ ...styles.card, borderTop: "4px solid #3b82f6" }}
        >
          <FaWallet size={24} color="#3b82f6" style={styles.icon} />
          <p style={styles.cardLabel}>
            {revenueRange === "1y"
              ? "1-Year"
              : revenueRange === "1m"
                ? "30-Day"
                : "7-Day"}{" "}
            Revenue
          </p>
          <h2 style={styles.cardValue}>₹{currentRevenue.toLocaleString()}</h2>
        </div>
        <div
          className="ha-card"
          style={{ ...styles.card, borderTop: "4px solid #10b981" }}
        >
          <FaBed size={24} color="#10b981" style={styles.icon} />
          <p style={styles.cardLabel}>Total Stays</p>
          <h2 style={styles.cardValue}>{data.stats.totalBookings}</h2>
        </div>
        <div
          className="ha-card"
          style={{ ...styles.card, borderTop: "4px solid #f59e0b" }}
        >
          <FaClock size={24} color="#f59e0b" style={styles.icon} />
          <p style={styles.cardLabel}>Pending Requests</p>
          <h2 style={styles.cardValue}>{data.stats.pendingRequests}</h2>
        </div>
      </div>

      {/* MIDDLE ROW: CHARTS */}
      <div style={styles.gridFlex}>
        {/* INCOME TRACKER AREA CHART */}
        <div
          className="ha-card"
          style={{ ...styles.card, flex: 2, minWidth: "400px" }}
        >
          <div style={styles.sectionHeader}>
            <h3 style={styles.chartTitle}>
              {revenueRange === "1y"
                ? "1-Year"
                : revenueRange === "1m"
                  ? "30-Day"
                  : "7-Day"}{" "}
              Income Tracker
            </h3>
            <div style={styles.controlGroup}>
              <AnimatedSelect
                value={revenueRange}
                onChange={(e) => setRevenueRange(e.target.value)}
                options={[
                  { value: "7d", label: "Last 7 Days" },
                  { value: "1m", label: "Last 1 Month" },
                  { value: "1y", label: "Last 1 Year" },
                ]}
              />
            </div>
          </div>

          <div style={{ height: "280px", width: "100%" }}>
            <ResponsiveContainer>
              <AreaChart
                data={data.chartData || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevHA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="dayName"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <RechartsTooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22d3ee"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRevHA)"
                  activeDot={{
                    r: 6,
                    fill: "#22d3ee",
                    stroke: "#0f172a",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BOOKING STATUS PIE CHART */}
        <div
          className="ha-card"
          style={{ ...styles.card, flex: 1, minWidth: "250px" }}
        >
          <h3 style={styles.chartTitle}>Booking Status</h3>
          <div style={{ height: "220px", width: "100%", position: "relative" }}>
            <ResponsiveContainer>
              <PieChart style={{ outline: "none" }}>
                <Pie
                  data={bookingPieData}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  style={{ outline: "none" }}
                >
                  {bookingPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      style={{ outline: "none" }}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                  cursor={false}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={styles.centerDonutText}>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "24px" }}>
                {data.stats.totalBookings}
              </h3>
              <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af" }}>
                Total
              </p>
            </div>
          </div>
          <div style={styles.legend}>
            <span style={{ color: PIE_COLORS[0] }}>● Approved</span>
            <span style={{ color: PIE_COLORS[1] }}>● Pending</span>
          </div>
        </div>
      </div>

      {/* RECENT BOOKINGS & PROPERTY STATUS */}
      <div style={{ ...styles.gridFlex, marginTop: "24px" }}>
        {/* BOOKINGS WIDGET */}
        <div
          className="ha-card"
          style={{ ...styles.card, flex: 2, minWidth: "400px" }}
        >
          <div style={styles.sectionHeader}>
            <h3 style={styles.chartTitle}>Recent Booking Activity</h3>
            <div style={styles.controlGroup}>
              <AnimatedSearch
                placeholder="Search status..."
                value={bSearch}
                onChange={(e) => {
                  setBSearch(e.target.value);
                  setBPage(1);
                }}
              />
              <AnimatedSelect
                value={bSort}
                onChange={(e) => {
                  setBSort(e.target.value);
                  setBPage(1);
                }}
                options={[
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" },
                  { value: "status", label: "Status" },
                ]}
              />
            </div>
          </div>

          {data.bookingsData.data.length === 0 ? (
            <div style={styles.emptyState}>No matching bookings found.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>GUEST</th>
                  <th style={styles.th}>HOTEL</th>
                  <th style={styles.th}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {data.bookingsData.data.map((b) => (
                  <tr key={b._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <FaUserCircle size={18} color="#9ca3af" />
                        <span style={{ color: "#fff", fontWeight: 600 }}>
                          {b.userId?.name || b.userId?.email || "Guest"}
                        </span>
                      </div>
                    </td>
                    <td style={styles.td}>{b.hotelId?.hotelName || "N/A"}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusPill,
                          background:
                            b.status === "pending"
                              ? "rgba(245, 158, 11, 0.15)"
                              : b.status === "cancelled"
                                ? "rgba(239, 68, 68, 0.15)"
                                : "rgba(16, 185, 129, 0.15)",
                          color:
                            b.status === "pending"
                              ? "#fde047"
                              : b.status === "cancelled"
                                ? "#fca5a5"
                                : "#86efac",
                          border: `1px solid ${b.status === "pending" ? "rgba(245, 158, 11, 0.3)" : b.status === "cancelled" ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                        }}
                      >
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={styles.paginationMini}>
            <button
              disabled={bPage === 1}
              onClick={() => setBPage(bPage - 1)}
              style={styles.pageBtnMini}
            >
              Prev
            </button>
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>
              Page {bPage} of {data.bookingsData.totalPages}
            </span>
            <button
              disabled={bPage === data.bookingsData.totalPages}
              onClick={() => setBPage(bPage + 1)}
              style={styles.pageBtnMini}
            >
              Next
            </button>
          </div>
        </div>

        {/* PROPERTIES WIDGET */}
        <div
          className="ha-card"
          style={{
            ...styles.card,
            flex: 1,
            minWidth: "250px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={styles.sectionHeaderCol}>
            <h3 style={styles.chartTitle}>My Properties</h3>
            <div style={styles.controlGroupFull}>
              <div style={{ flex: 1 }}>
                <AnimatedSearch
                  placeholder="Search names..."
                  value={pSearch}
                  onChange={(e) => {
                    setPSearch(e.target.value);
                    setPPage(1);
                  }}
                />
              </div>
              <AnimatedSelect
                value={pSort}
                onChange={(e) => {
                  setPSort(e.target.value);
                  setPPage(1);
                }}
                options={[
                  { value: "a-z", label: "A-Z" },
                  { value: "status", label: "Status" },
                ]}
              />
            </div>
          </div>

          {data.propertiesData.data.length === 0 ? (
            <div style={styles.emptyState}>No properties found.</div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "12px",
                flex: 1,
              }}
            >
              {data.propertiesData.data.map((hotel) => (
                <div key={hotel._id} style={styles.propertyCard}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "8px",
                      }}
                    >
                      <FaBuilding size={16} color="#22d3ee" />
                    </div>
                    <span
                      style={{
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      {hotel.hotelName}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: "6px",
                      background: hotel.isApproved
                        ? "rgba(16, 185, 129, 0.1)"
                        : "rgba(245, 158, 11, 0.1)",
                      color: hotel.isApproved ? "#10b981" : "#f59e0b",
                    }}
                  >
                    {hotel.isApproved ? "LIVE" : "PENDING"}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div
            style={{
              ...styles.paginationMini,
              marginTop: "auto",
              paddingTop: "16px",
            }}
          >
            <button
              disabled={pPage === 1}
              onClick={() => setPPage(pPage - 1)}
              style={styles.pageBtnMini}
            >
              Prev
            </button>
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>
              Page {pPage} of {data.propertiesData.totalPages}
            </span>
            <button
              disabled={pPage === data.propertiesData.totalPages}
              onClick={() => setPPage(pPage + 1)}
              style={styles.pageBtnMini}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* REVIEWS WIDGET */}
      <div className="ha-card" style={{ ...styles.card, marginTop: "24px" }}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.chartTitle}>Recent Guest Reviews</h3>
          <div style={styles.controlGroup}>
            <AnimatedSearch
              placeholder="Search reviews..."
              value={rSearch}
              onChange={(e) => {
                setRSearch(e.target.value);
                setRPage(1);
              }}
            />
            <AnimatedSelect
              value={rSort}
              onChange={(e) => {
                setRSort(e.target.value);
                setRPage(1);
              }}
              options={[
                { value: "newest", label: "Newest First" },
                { value: "highest", label: "Highest Rating" },
                { value: "lowest", label: "Lowest Rating" },
              ]}
            />
          </div>
        </div>

        <div style={styles.listContainer}>
          {data.reviewsData.data.length === 0 ? (
            <div style={styles.emptyState}>No matching reviews found.</div>
          ) : (
            data.reviewsData.data.map((review) => (
              <div key={review._id} style={styles.reviewItem}>
                <div style={styles.reviewHeader}>
                  <div style={styles.reviewMain}>
                    <div style={{ ...styles.avatar, background: "#3b82f6" }}>
                      {review.userId?.name
                        ? review.userId.name.charAt(0).toUpperCase()
                        : "G"}
                    </div>
                    <div>
                      <h4 style={styles.reviewerName}>
                        {review.userId?.name || "Guest"}
                      </h4>
                      <p style={styles.reviewProperty}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div style={styles.ratingBadge}>
                    {review.rating.toFixed(1)}{" "}
                    <FaStar size={10} style={{ color: "#facc15" }} />
                  </div>
                </div>
                <p style={styles.reviewText}>"{review.comment}"</p>
              </div>
            ))
          )}
        </div>
        <div
          style={{
            ...styles.paginationMini,
            justifyContent: "center",
            marginTop: "16px",
          }}
        >
          <button
            disabled={rPage === 1}
            onClick={() => setRPage(rPage - 1)}
            style={styles.pageBtnMini}
          >
            Prev
          </button>
          <span
            style={{ fontSize: "11px", color: "#9ca3af", margin: "0 16px" }}
          >
            Page {rPage} of {data.reviewsData.totalPages}
          </span>
          <button
            disabled={rPage === data.reviewsData.totalPages}
            onClick={() => setRPage(rPage + 1)}
            style={styles.pageBtnMini}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingBottom: "40px",
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
  },
  gridTop: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    marginBottom: "24px",
  },
  gridFlex: { display: "flex", flexWrap: "wrap", gap: "24px" },

  card: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "24px",
    backdropFilter: "blur(12px)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  icon: { marginBottom: "16px" },
  cardLabel: {
    margin: "0 0 8px 0",
    fontSize: "13px",
    color: "#9ca3af",
    textTransform: "uppercase",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },
  cardValue: { margin: 0, fontSize: "36px", fontWeight: 800, color: "#fff" },
  chartTitle: {
    fontSize: "18px",
    fontWeight: 700,
    margin: "0 0 20px 0",
    color: "#e2e8f0",
  },

  centerDonutText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    pointerEvents: "none",
  },
  legend: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    fontSize: "12px",
    fontWeight: 700,
    marginTop: "10px",
  },
  customTooltip: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "12px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
  },
  tooltipLabel: {
    margin: "0 0 8px 0",
    fontSize: "12px",
    color: "#9ca3af",
    textTransform: "uppercase",
    fontWeight: 800,
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  sectionHeaderCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "12px",
  },
  controlGroup: { display: "flex", alignItems: "center", gap: "8px" },
  controlGroupFull: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
  },

  fancySearchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "6px 12px",
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
    fontFamily: "'Inter', sans-serif",
  },
  fancySelect: {
    padding: "8px 12px",
    borderRadius: "12px",
    background: "rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#e2e8f0",
    fontSize: "12px",
    outline: "none",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    WebkitAppearance: "none",
    MozAppearance: "none",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%2364748b' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`,
    backgroundRepeat: "no-repeat",
    backgroundPositionX: "calc(100% - 8px)",
    backgroundPositionY: "center",
    paddingRight: "28px",
  },

  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: {
    color: "#6b7280",
    fontSize: "11px",
    fontWeight: 700,
    padding: "12px 12px 12px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  },
  tr: { borderBottom: "1px solid rgba(255, 255, 255, 0.04)" },
  td: { padding: "14px 14px 14px 0", fontSize: "13px", color: "#d1d5db" },
  statusPill: {
    padding: "4px 8px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.5px",
  },

  propertyCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    padding: "12px",
    borderRadius: "12px",
  },

  listContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },
  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#6b7280",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "16px",
    border: "1px dashed rgba(255,255,255,0.1)",
    gridColumn: "1 / -1",
  },
  reviewItem: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "20px",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  reviewMain: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 800,
    color: "#fff",
  },
  reviewerName: {
    margin: "0 0 4px 0",
    fontSize: "15px",
    fontWeight: 700,
    color: "#fff",
  },
  reviewProperty: { margin: 0, fontSize: "11px", color: "#9ca3af" },
  ratingBadge: {
    background: "rgba(250, 204, 21, 0.1)",
    border: "1px solid rgba(250, 204, 21, 0.2)",
    color: "#facc15",
    padding: "4px 8px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  reviewText: {
    fontSize: "13px",
    color: "#d1d5db",
    margin: 0,
    lineHeight: "1.6",
    fontStyle: "italic",
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
};
