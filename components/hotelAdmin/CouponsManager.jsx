import React, { useState, useEffect } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { FaTicketAlt, FaPlus, FaTrash, FaEdit } from "react-icons/fa";

function CouponsManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    couponCode: "",
    discountType: "percentage",
    discountValue: "",
    minBookingAmount: 0,
    validFrom: "",
    validUntil: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/coupons/my-coupons", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(res.data.data || []);
    } catch (err) {
      console.error("Error fetching coupons", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (editId) {
        await axios.put(`/api/coupons/update/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/api/coupons/create", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowModal(false);
      setEditId(null);
      fetchCoupons();
    } catch (err) {
      alert("Error saving coupon");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/coupons/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCoupons();
    } catch (err) {
      alert("Error deleting coupon");
    }
  };

  const openEdit = (coupon) => {
    setEditId(coupon._id);
    setFormData({
      couponCode: coupon.couponCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minBookingAmount: coupon.minBookingAmount,
      validFrom: new Date(coupon.validFrom).toISOString().split("T")[0],
      validUntil: new Date(coupon.validUntil).toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Promotions & Coupons</h2>
          <p style={styles.subtitle}>
            Create discount codes to attract more bookings.
          </p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setFormData({
              couponCode: "",
              discountType: "percentage",
              discountValue: "",
              minBookingAmount: 0,
              validFrom: "",
              validUntil: "",
            });
            setShowModal(true);
          }}
          style={styles.addBtn}
        >
          <FaPlus /> Create Coupon
        </button>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={styles.loaderBox}>
            <ClipLoader color="#22d3ee" size={36} />
          </div>
        ) : coupons.length === 0 ? (
          <div style={styles.emptyText}>No active coupons found.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>CODE</th>
                <th style={styles.th}>DISCOUNT</th>
                <th style={styles.th}>MIN SPEND</th>
                <th style={styles.th}>VALIDITY</th>
                <th style={{ ...styles.th, textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} style={styles.tr}>
                  <td style={styles.tdBold}>
                    <span style={styles.codeBadge}>{c.couponCode}</span>
                  </td>
                  <td style={styles.td}>
                    {c.discountType === "percentage"
                      ? `${c.discountValue}% OFF`
                      : `₹${c.discountValue} FLAT`}
                  </td>
                  <td style={styles.td}>₹{c.minBookingAmount}</td>
                  <td style={styles.td}>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                      From: {new Date(c.validFrom).toLocaleDateString()}
                      <br />
                      To: {new Date(c.validUntil).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <button onClick={() => openEdit(c)} style={styles.editBtn}>
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      style={styles.deleteBtn}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>
              {editId ? "Edit Coupon" : "Create New Coupon"}
            </h3>
            <form onSubmit={handleSave} style={styles.form}>
              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUMMER20"
                    value={formData.couponCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        couponCode: e.target.value.toUpperCase(),
                      })
                    }
                    style={styles.input}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Min Booking Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.minBookingAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minBookingAmount: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                    style={styles.input}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Discount Value</label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Valid From</label>
                  <input
                    type="date"
                    required
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Valid Until</label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.actions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn}>
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: { fontSize: "20px", fontWeight: 700, margin: 0, color: "#fff" },
  subtitle: { color: "#9ca3af", fontSize: "13px", margin: 0 },
  addBtn: {
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
  card: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "18px",
    padding: "20px",
    backdropFilter: "blur(10px)",
  },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: {
    color: "#6b7280",
    fontSize: "11px",
    fontWeight: 700,
    padding: "12px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
    letterSpacing: "0.5px",
  },
  tr: { borderBottom: "1px solid rgba(255, 255, 255, 0.04)" },
  tdBold: { padding: "12px", color: "#fff" },
  td: { padding: "12px", color: "#d1d5db", fontSize: "13px" },
  codeBadge: {
    background: "rgba(34, 211, 238, 0.15)",
    border: "1px dashed rgba(34, 211, 238, 0.5)",
    color: "#67e8f9",
    padding: "4px 10px",
    borderRadius: "6px",
    fontFamily: "monospace",
    fontWeight: 700,
  },
  editBtn: {
    background: "transparent",
    border: "none",
    color: "#60a5fa",
    cursor: "pointer",
    padding: "6px",
    fontSize: "14px",
  },
  deleteBtn: {
    background: "transparent",
    border: "none",
    color: "#fca5a5",
    cursor: "pointer",
    padding: "6px",
    fontSize: "14px",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
  },
  modalCard: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "20px",
    padding: "24px",
    width: "450px",
    color: "#fff",
  },
  modalTitle: { margin: "0 0 16px 0", fontSize: "18px" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  row: { display: "flex", gap: "12px" },
  label: {
    fontSize: "11px",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: "4px",
    display: "block",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(0,0,0,0.4)",
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },
  actions: { display: "flex", gap: "10px", marginTop: "10px" },
  cancelBtn: {
    flex: 1,
    padding: "10px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#9ca3af",
    borderRadius: "8px",
    cursor: "pointer",
  },
  saveBtn: {
    flex: 1,
    padding: "10px",
    background: "#2563eb",
    border: "none",
    color: "#fff",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default CouponsManager;
