import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import gsap from "gsap";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
    );
  }, []);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleFocus(e) {
    gsap.to(e.target, { scale: 1.02, duration: 0.2, ease: "power2.out" });
  }

  function handleBlur(e) {
    gsap.to(e.target, { scale: 1, duration: 0.2, ease: "power2.out" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/authuser/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("theme", res.data.theme);

      // ==========================================
      // ROLE-BASED REDIRECTION LOGIC
      // ==========================================
      const userRole = res.data.role?.toLowerCase();

      if (userRole === "superadmin") {
        navigate("/superadmin-dashboard");
      } else if (userRole === "hoteladmin") {
        navigate("/hoteladmin-dashboard");
      } else if (userRole === "employee") {
        navigate("/employee-dashboard");
      } else {
        navigate("/user"); // Fallback for standard users
      }
      // ==========================================
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      gsap.fromTo(
        cardRef.current,
        { x: -8 },
        { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" },
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />
      <div ref={cardRef} style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Log in to continue managing your tasks</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required
            style={styles.input}
          />

          <div style={styles.forgotRow}>
            <Link to="/forgot-password" style={styles.link}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
            onMouseEnter={(e) =>
              gsap.to(e.target, { scale: 1.03, duration: 0.2 })
            }
            onMouseLeave={(e) => gsap.to(e.target, { scale: 1, duration: 0.2 })}
          >
            {loading ? <ClipLoader color="#fff" size={20} /> : "Log In"}
          </button>
        </form>

        <p style={styles.bottomText}>
          Don't have an account?{" "}
          <Link to="/signup" style={styles.link}>
            Sign up
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
  },
  glowOne: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)",
    top: "-100px",
    left: "-100px",
    filter: "blur(60px)",
  },
  glowTwo: {
    position: "absolute",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(34,211,238,0.25), transparent 70%)",
    bottom: "-80px",
    right: "-80px",
    filter: "blur(60px)",
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "380px",
    padding: "40px 32px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  title: {
    color: "#fff",
    fontSize: "26px",
    fontWeight: 700,
    marginBottom: "6px",
    textAlign: "center",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  input: {
    padding: "13px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
  },
  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-6px",
  },
  link: {
    color: "#a78bfa",
    fontSize: "13px",
    textDecoration: "none",
  },
  button: {
    marginTop: "8px",
    padding: "13px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #22d3ee)",
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
  bottomText: {
    color: "#9ca3af",
    fontSize: "13px",
    textAlign: "center",
    marginTop: "22px",
  },
};

export default Login;
