import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import gsap from "gsap";
import { FaPlus, FaTrash, FaUndo, FaEye, FaTimes } from "react-icons/fa";

function LocationManager({ activeTab }) {
  const [list, setList] = useState([]);
  const [isTrashView, setIsTrashView] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Loading & Error states matching your Signup component
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cascading dropdown arrays
  const [statesDropdown, setStatesDropdown] = useState([]);
  const [districtsDropdown, setDistrictsDropdown] = useState([]);

  // Form input values
  const [nameInput, setNameInput] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Popup modal data
  const [popupData, setPopupData] = useState(null);

  const containerRef = useRef(null);
  const formRef = useRef(null);
  const modalRef = useRef(null);

  // 1. FETCH TABLE DATA
  const fetchList = async () => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (activeTab === "states") {
        response = await axios.get(
          `/api/states/allState?isDeleted=${isTrashView}`,
        );
      } else if (activeTab === "districts") {
        response = await axios.get(
          `/api/districts/allDistrict?isDeleted=${isTrashView}`,
        );
      } else if (activeTab === "cities") {
        response = await axios.get(
          `/api/cities/allCity?isDeleted=${isTrashView}`,
        );
      }

      if (response && response.data) {
        setList(response.data.data || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch records from server",
      );
    } finally {
      setLoading(false);
    }
  };

  // Trigger animations and data fetching on tab or view change
  useEffect(() => {
    fetchList();
    setShowForm(false);
    setError("");
    setSuccess("");

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
    );

    // Fetch States for dropdowns when needed
    if (activeTab === "districts" || activeTab === "cities") {
      axios
        .get("/api/states/allState")
        .then((res) => setStatesDropdown(res.data.data || []))
        .catch(() => console.error("Could not load states for dropdown"));
    }
  }, [activeTab, isTrashView]);

  // Animate form appearance
  useEffect(() => {
    if (showForm && formRef.current) {
      gsap.fromTo(
        formRef.current,
        { height: 0, opacity: 0, overflow: "hidden" },
        { height: "auto", opacity: 1, duration: 0.4, ease: "power2.out" },
      );
    }
  }, [showForm]);

  // Animate modal appearance
  useEffect(() => {
    if (popupData && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" },
      );
    }
  }, [popupData]);

  // 2. CASCADING DROPDOWN: FETCH DISTRICTS WHEN STATE IS SELECTED
  useEffect(() => {
    if (selectedState && activeTab === "cities") {
      axios
        .get(`/api/districts/allDistrict?stateId=${selectedState}`)
        .then((res) => setDistrictsDropdown(res.data.data || []))
        .catch(() => console.error("Could not load districts"));
    } else {
      setDistrictsDropdown([]);
    }
  }, [selectedState, activeTab]);

  function handleFocus(e) {
    gsap.to(e.target, { scale: 1.02, duration: 0.2, ease: "power2.out" });
  }

  function handleBlur(e) {
    gsap.to(e.target, { scale: 1, duration: 0.2, ease: "power2.out" });
  }

  // 3. SAVE NEW ITEM
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (activeTab === "states") {
        await axios.post("/api/states/createState", {
          name: nameInput,
        });
      } else if (activeTab === "districts") {
        await axios.post("/api/districts/createDistrict", {
          name: nameInput,
          stateId: selectedState,
        });
      } else if (activeTab === "cities") {
        await axios.post("/api/cities/createCity", {
          name: nameInput,
          stateId: selectedState,
          districtId: selectedDistrict,
        });
      }

      setSuccess("Record added successfully!");
      setNameInput("");
      setSelectedState("");
      setSelectedDistrict("");
      setShowForm(false);
      fetchList();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving record");
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { x: -8 },
          { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" },
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // 4. SOFT DELETE
  const deleteItem = async (id) => {
    setActionLoading(id);
    try {
      if (activeTab === "states") {
        await axios.patch(`/api/states/soft-delete/${id}`);
      } else if (activeTab === "districts") {
        await axios.patch(`/api/districts/soft-delete/${id}`);
      } else if (activeTab === "cities") {
        await axios.patch(`/api/cities/soft-delete/${id}`);
      }
      setSuccess("Moved to trash");
      fetchList();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete item");
    } finally {
      setActionLoading(null);
    }
  };

  // 5. RESTORE
  const restoreItem = async (id) => {
    setActionLoading(id);
    try {
      if (activeTab === "states") {
        await axios.patch(`/api/states/restore/${id}`);
      } else if (activeTab === "districts") {
        await axios.patch(`/api/districts/restore/${id}`);
      } else if (activeTab === "cities") {
        await axios.patch(`/api/cities/restore/${id}`);
      }
      setSuccess("Restored successfully");
      fetchList();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to restore item");
    } finally {
      setActionLoading(null);
    }
  };

  // 6. VIEW BY ID
  const viewItem = async (id) => {
    console.log("Fetching item with ID:", id, "Type:", typeof id);
    setActionLoading(id);
    try {
      let response;
      if (activeTab === "states") {
        response = await axios.get(`/api/states/stateId/${id}`);
      } else if (activeTab === "districts") {
        response = await axios.get(`/api/districts/districtId/${id}`);
      } else if (activeTab === "cities") {
        response = await axios.get(`/api/cities/cityId/${id}`);
      }

      if (response && response.data) {
        setPopupData(response.data.data);
      }
    } catch (err) {
      setError("Could not fetch details for this ID");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div ref={containerRef} style={styles.card}>
      {/* Header & Controls */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{activeTab.toUpperCase()} Directory</h1>
          <p style={styles.subtitle}>
            Manage regional assignments and active status
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.addButton}
          onMouseEnter={(e) =>
            gsap.to(e.target, { scale: 1.05, duration: 0.2 })
          }
          onMouseLeave={(e) => gsap.to(e.target, { scale: 1, duration: 0.2 })}
        >
          <FaPlus /> <span>Add {activeTab.slice(0, -1)}</span>
        </button>
      </div>

      {/* Alerts */}
      {error && <div style={styles.errorBox}>{error}</div>}
      {success && <div style={styles.successBox}>{success}</div>}

      {/* Animated Add Form */}
      {showForm && (
        <form ref={formRef} onSubmit={handleSave} style={styles.form}>
          <div style={styles.formRow}>
            {(activeTab === "districts" || activeTab === "cities") && (
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedDistrict("");
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
                style={styles.input}
              >
                <option value="" style={styles.option}>
                  -- 1. Select State --
                </option>
                {statesDropdown.map((s) => (
                  <option key={s._id} value={s._id} style={styles.option}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}

            {activeTab === "cities" && (
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
                disabled={!selectedState}
                style={{ ...styles.input, opacity: !selectedState ? 0.5 : 1 }}
              >
                <option value="" style={styles.option}>
                  -- 2. Select District --
                </option>
                {districtsDropdown.map((d) => (
                  <option key={d._id} value={d._id} style={styles.option}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              placeholder={`Enter ${activeTab.slice(0, -1)} name`}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formActions}>
            <button
              type="submit"
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? <ClipLoader color="#fff" size={16} /> : "Save Record"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div style={styles.tabsGroup}>
        <button
          onClick={() => setIsTrashView(false)}
          style={{ ...styles.tab, ...(!isTrashView ? styles.tabActive : {}) }}
        >
          Active Records
        </button>
        <button
          onClick={() => setIsTrashView(true)}
          style={{ ...styles.tab, ...(isTrashView ? styles.tabActive : {}) }}
        >
          Trash (Soft Deleted)
        </button>
      </div>

      {/* Data Table */}
      <div style={styles.tableContainer}>
        {loading && !actionLoading ? (
          <div style={styles.loaderContainer}>
            <ClipLoader color="#22d3ee" size={36} />
            <p style={styles.loaderText}>Loading geographical data...</p>
          </div>
        ) : list.length === 0 ? (
          <div style={styles.emptyState}>
            No {activeTab} found in this view.
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>NAME</th>
                {activeTab !== "states" && <th style={styles.th}>STATE</th>}
                {activeTab === "cities" && <th style={styles.th}>DISTRICT</th>}
                <th style={{ ...styles.th, textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item._id} style={styles.tr}>
                  <td style={styles.tdBold}>{item.name}</td>
                  {activeTab !== "states" && (
                    <td style={styles.td}>{item.stateId?.name || "N/A"}</td>
                  )}
                  {activeTab === "cities" && (
                    <td style={styles.td}>{item.districtId?.name || "N/A"}</td>
                  )}
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    {actionLoading === item._id ? (
                      <ClipLoader color="#8b5cf6" size={18} />
                    ) : !isTrashView ? (
                      <button
                        onClick={() => deleteItem(item._id)}
                        style={styles.actionBtnDelete}
                        title="Soft Delete"
                        onMouseEnter={(e) =>
                          gsap.to(e.currentTarget, {
                            scale: 1.1,
                            duration: 0.1,
                          })
                        }
                        onMouseLeave={(e) =>
                          gsap.to(e.currentTarget, { scale: 1, duration: 0.1 })
                        }
                      >
                        <FaTrash />
                      </button>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          onClick={() => restoreItem(item._id)}
                          style={styles.actionBtnRestore}
                          title="Restore"
                          onMouseEnter={(e) =>
                            gsap.to(e.currentTarget, {
                              scale: 1.1,
                              duration: 0.1,
                            })
                          }
                          onMouseLeave={(e) =>
                            gsap.to(e.currentTarget, {
                              scale: 1,
                              duration: 0.1,
                            })
                          }
                        >
                          <FaUndo />
                        </button>
                        <button
                          onClick={() => viewItem(item._id)}
                          style={styles.actionBtnView}
                          title="View ID Details"
                          onMouseEnter={(e) =>
                            gsap.to(e.currentTarget, {
                              scale: 1.1,
                              duration: 0.1,
                            })
                          }
                          onMouseLeave={(e) =>
                            gsap.to(e.currentTarget, {
                              scale: 1,
                              duration: 0.1,
                            })
                          }
                        >
                          <FaEye />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View ID Glass Modal */}
      {popupData && (
        <div style={styles.modalOverlay}>
          <div ref={modalRef} style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Record Details</h3>
              <button
                onClick={() => setPopupData(null)}
                style={styles.modalCloseBtn}
              >
                <FaTimes />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalRow}>
                <span style={styles.modalLabel}>Database ID:</span>
                <span style={styles.modalValue}>{popupData._id}</span>
              </div>
              <div style={styles.modalRow}>
                <span style={styles.modalLabel}>Name:</span>
                <span style={styles.modalValue}>{popupData.name}</span>
              </div>
              {popupData.stateId && (
                <div style={styles.modalRow}>
                  <span style={styles.modalLabel}>Parent State:</span>
                  <span style={styles.modalValue}>
                    {popupData.stateId.name}
                  </span>
                </div>
              )}
              {popupData.districtId && (
                <div style={styles.modalRow}>
                  <span style={styles.modalLabel}>Parent District:</span>
                  <span style={styles.modalValue}>
                    {popupData.districtId.name}
                  </span>
                </div>
              )}
              <div style={styles.modalRow}>
                <span style={styles.modalLabel}>Status:</span>
                <span
                  style={{
                    ...styles.modalValue,
                    color: popupData.isDeleted ? "#fca5a5" : "#86efac",
                  }}
                >
                  {popupData.isDeleted ? "Soft Deleted" : "Active"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    position: "relative",
    zIndex: 1,
    padding: "32px",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    color: "#fff",
    fontSize: "24px",
    fontWeight: 700,
    margin: "0 0 4px 0",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: "14px",
    margin: 0,
  },
  addButton: {
    padding: "12px 20px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #22d3ee, #8b5cf6)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 15px rgba(34, 211, 238, 0.3)",
  },
  errorBox: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    fontSize: "13px",
    padding: "12px 16px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  successBox: {
    background: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#86efac",
    fontSize: "13px",
    padding: "12px 16px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  form: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "24px",
  },
  formRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(10, 10, 15, 0.6)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    flex: "1 1 200px",
  },
  option: {
    background: "#0a0a0f",
    color: "#fff",
  },
  formActions: {
    display: "flex",
    gap: "12px",
  },
  submitButton: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "120px",
  },
  cancelButton: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "transparent",
    color: "#9ca3af",
    fontWeight: 500,
    cursor: "pointer",
  },
  tabsGroup: {
    display: "flex",
    gap: "12px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "12px",
    marginBottom: "20px",
  },
  tab: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: "8px",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "rgba(34, 211, 238, 0.1)",
    color: "#22d3ee",
  },
  tableContainer: {
    flex: 1,
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    color: "#6b7280",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1px",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  },
  tr: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
    transition: "background 0.2s",
  },
  tdBold: {
    padding: "16px",
    color: "#fff",
    fontWeight: 600,
    fontSize: "14px",
  },
  td: {
    padding: "16px",
    color: "#9ca3af",
    fontSize: "14px",
  },
  actionBtnDelete: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    padding: "8px 10px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  actionBtnRestore: {
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#86efac",
    padding: "8px 10px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  actionBtnView: {
    background: "rgba(34, 211, 238, 0.15)",
    border: "1px solid rgba(34, 211, 238, 0.3)",
    color: "#67e8f9",
    padding: "8px 10px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
    gap: "16px",
  },
  loaderText: {
    color: "#6b7280",
    fontSize: "14px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  modalCard: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    width: "400px",
    padding: "24px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "16px",
    marginBottom: "16px",
  },
  modalTitle: {
    color: "#fff",
    fontSize: "18px",
    fontWeight: 700,
    margin: 0,
  },
  modalCloseBtn: {
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: "16px",
  },
  modalBody: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  modalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
  },
  modalLabel: {
    color: "#6b7280",
  },
  modalValue: {
    color: "#fff",
    fontWeight: 500,
    textAlign: "right",
    wordBreak: "break-all",
    maxWidth: "220px",
  },
};

export default LocationManager;
