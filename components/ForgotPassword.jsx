import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import gsap from "gsap";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
    );
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/authuser/forgetPassword", { email });
      setSent(true);
      setTimeout(() => navigate("/reset-password", { state: { email } }), 1200);
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
      <div ref={cardRef} style={styles.card}>
        <h1 style={styles.title}>Forgot Password?</h1>
        <p style={styles.subtitle}>
          Enter your email and we'll send you a reset code
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {sent && (
          <div style={styles.successBox}>
            OTP sent! Redirecting to reset page...
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={(e) => gsap.to(e.target, { scale: 1.02, duration: 0.2 })}
            onBlur={(e) => gsap.to(e.target, { scale: 1, duration: 0.2 })}
            required
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
            onMouseEnter={(e) =>
              gsap.to(e.target, { scale: 1.03, duration: 0.2 })
            }
            onMouseLeave={(e) => gsap.to(e.target, { scale: 1, duration: 0.2 })}
          >
            {loading ? (
              <ClipLoader color="#fff" size={20} />
            ) : (
              "Send Reset Code"
            )}
          </button>
        </form>

        <p style={styles.bottomText}>
          Remembered your password?{" "}
          <Link to="/login" style={styles.link}>
            Back to login
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
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)",
    top: "-120px",
    left: "50%",
    transform: "translateX(-50%)",
    filter: "blur(70px)",
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
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "6px",
    textAlign: "center",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "28px",
    lineHeight: "1.5",
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
  link: {
    color: "#a78bfa",
    fontSize: "13px",
    textDecoration: "none",
  },
};

export default ForgotPassword;
