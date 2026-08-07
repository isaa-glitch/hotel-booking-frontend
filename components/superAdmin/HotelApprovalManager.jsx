import React, { useState, useEffect } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { FaCheck, FaTimes, FaBuilding } from "react-icons/fa";

function HotelApprovalManager() {
  const [pendingHotels, setPendingHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/hotels/pending-approval");
      setPendingHotels(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await axios.patch(`/api/hotels/approve/${id}`);
    fetchPending();
  };

  return (
    <div style={{ padding: "24px", color: "#fff" }}>
      <h2>Pending Hotel Submissions</h2>
      {loading ? (
        <ClipLoader color="#22d3ee" />
      ) : (
        <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
          {pendingHotels.map((h) => (
            <div
              key={h._id}
              style={{
                background: "rgba(255,255,255,0.04)",
                padding: "16px",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h4>{h.hotelName}</h4>
                <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                  Owner: {h.hotelAdminId?.name} ({h.hotelAdminId?.email})
                </p>
              </div>
              <button
                onClick={() => handleApprove(h._id)}
                style={{
                  background: "#16a34a",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <FaCheck /> Approve Listing
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HotelApprovalManager;
