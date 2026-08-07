import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import gsap from "gsap";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
} from "recharts";
import { FaServer, FaDoorOpen, FaWallet } from "react-icons/fa";

// Glowing Colors for Charts
const ADMIN_COLORS = ["#22d3ee", "#475569"]; // Cyan (Active), Gray (Inactive)
const HOTEL_COLORS = ["#10b981", "#f59e0b"]; // Emerald (Approved), Amber (Pending)

export default function SuperAdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/dashboard/super-admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.data);

      // GSAP Stagger Animation for Cards
      setTimeout(() => {
        gsap.fromTo(
          ".sa-card",
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.2)",
          },
        );
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "100px" }}
      >
        <ClipLoader color="#22d3ee" size={50} />
      </div>
    );
  }

  return (
    <div ref={containerRef} style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Global Command Center</h1>
        <p style={styles.subtitle}>
          Real-time platform analytics and system health.
        </p>
      </div>

      {/* TOP ROW: QUICK STATS */}
      <div style={styles.gridTop}>
        <div
          className="sa-card"
          style={{ ...styles.card, borderTop: "4px solid #3b82f6" }}
        >
          <FaWallet size={24} color="#3b82f6" style={styles.icon} />
          <p style={styles.cardLabel}>7-Day Platform Revenue</p>
          <h2 style={styles.cardValue}>
            ₹{data.stats.totalRevenue.toLocaleString()}
          </h2>
        </div>

        <div
          className="sa-card"
          style={{ ...styles.card, borderTop: "4px solid #8b5cf6" }}
        >
          <FaDoorOpen size={24} color="#8b5cf6" style={styles.icon} />
          <p style={styles.cardLabel}>Total Rooms on Platform</p>
          <h2 style={styles.cardValue}>{data.stats.totalRooms}</h2>
        </div>

        <div
          className="sa-card"
          style={{ ...styles.card, borderTop: "4px solid #10b981" }}
        >
          <FaServer size={24} color="#10b981" style={styles.icon} />
          <p style={styles.cardLabel}>System Status</p>
          <h2 style={{ ...styles.cardValue, color: "#10b981" }}>Healthy</h2>
        </div>
      </div>

      {/* BOTTOM ROW: CHARTS */}
      <div style={styles.gridBottom}>
        {/* REVENUE AREA CHART */}
        <div
          className="sa-card"
          style={{ ...styles.card, gridColumn: "span 2" }}
        >
          <h3 style={styles.chartTitle}>Revenue Trends (Last 7 Days)</h3>
          <div style={{ height: "250px", width: "100%" }}>
            <ResponsiveContainer>
              <AreaChart
                data={data.revenueChart}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="dayName"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ADMINS DONUT CHART */}
        <div className="sa-card" style={styles.card}>
          <h3 style={styles.chartTitle}>Hotel Admins Health</h3>
          <div style={{ height: "200px", width: "100%", position: "relative" }}>
            <ResponsiveContainer>
              <PieChart style={{ outline: "none" }}>
                <Pie
                  data={data.adminChart}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  style={{ outline: "none" }} // <-- Fixes click box
                >
                  {data.adminChart.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={ADMIN_COLORS[index % ADMIN_COLORS.length]}
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
                  itemStyle={{ color: "#fff" }} // <-- Fixes text color
                  cursor={false}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div style={styles.centerDonutText}>
              <h3 style={{ margin: 0, color: "#fff" }}>
                {data.adminChart[0].value + data.adminChart[1].value}
              </h3>
              <p style={{ margin: 0, fontSize: "10px", color: "#9ca3af" }}>
                Total
              </p>
            </div>
          </div>
          <div style={styles.legend}>
            <span style={{ color: ADMIN_COLORS[0] }}>● Active</span>
            <span style={{ color: ADMIN_COLORS[1] }}>● Inactive</span>
          </div>
        </div>

        {/* HOTELS DONUT CHART */}
        <div className="sa-card" style={styles.card}>
          <h3 style={styles.chartTitle}>Property Approvals</h3>
          <div style={{ height: "200px", width: "100%", position: "relative" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.hotelChart}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.hotelChart.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={HOTEL_COLORS[index % HOTEL_COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={styles.centerDonutText}>
              <h3 style={{ margin: 0, color: "#fff" }}>
                {data.hotelChart[0].value + data.hotelChart[1].value}
              </h3>
              <p style={{ margin: 0, fontSize: "10px", color: "#9ca3af" }}>
                Hotels
              </p>
            </div>
          </div>
          <div style={styles.legend}>
            <span style={{ color: HOTEL_COLORS[0] }}>● Approved</span>
            <span style={{ color: HOTEL_COLORS[1] }}>● Pending</span>
          </div>
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
  header: { marginBottom: "32px" },
  title: {
    fontSize: "32px",
    fontWeight: 900,
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
    background: "linear-gradient(to right, #fff, #9ca3af)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: { color: "#9ca3af", margin: 0, fontSize: "15px" },

  gridTop: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    marginBottom: "24px",
  },
  gridBottom: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
  },

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
    fontSize: "16px",
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
};
