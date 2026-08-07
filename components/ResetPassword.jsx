import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import gsap from "gsap";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // Automatically grab the email passed from ForgotPassword.jsx
  const passedEmail = location.state?.email || "";

  const [formData, setFormData] = useState({
    email: passedEmail,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // If someone tries to visit /reset-password directly without going through Forgot Password first
    if (!passedEmail) {
      navigate("/forgot-password");
    }

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
    );
  }, [passedEmail, navigate]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Frontend validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match!");
      shakeCard();
      return;
    }

    setLoading(true);
    try {
      await axios.post("/authuser/resetPassword", {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword, // <-- ADD THIS LINE
      });

      setSuccess("Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid OTP or failed to reset password.",
      );
      shakeCard();
    } finally {
      setLoading(false);
    }
  }

  const shakeCard = () => {
    gsap.fromTo(
      cardRef.current,
      { x: -8 },
      { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" },
    );
  };

  if (!passedEmail) return null; // Prevents flashing before redirect

  return (
    <div style={styles.wrapper}>
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />
      <div ref={cardRef} style={styles.card}>
        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>
          Enter the code sent to your email and choose a new password.
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleResetPassword} style={styles.form}>
          <input
            type="email"
            name="email"
            disabled
            value={formData.email}
            style={{ ...styles.input, opacity: 0.6, cursor: "not-allowed" }}
          />
          <input
            type="text"
            name="otp"
            placeholder="6-digit OTP code"
            value={formData.otp}
            onChange={handleChange}
            onFocus={(e) => gsap.to(e.target, { scale: 1.02, duration: 0.2 })}
            onBlur={(e) => gsap.to(e.target, { scale: 1, duration: 0.2 })}
            required
            maxLength={6}
            style={{
              ...styles.input,
              letterSpacing: "4px",
              textAlign: "center",
            }}
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New password"
            value={formData.newPassword}
            onChange={handleChange}
            onFocus={(e) => gsap.to(e.target, { scale: 1.02, duration: 0.2 })}
            onBlur={(e) => gsap.to(e.target, { scale: 1, duration: 0.2 })}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
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
              "Update Password"
            )}
          </button>
        </form>

        <p style={styles.bottomText}>
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
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(34,211,238,0.25), transparent 70%)",
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
      "radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)",
    bottom: "-80px",
    right: "-80px",
    filter: "blur(60px)",
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "400px",
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
    fontSize: "13px",
    textAlign: "center",
    marginBottom: "28px",
    lineHeight: "1.5",
  },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  input: {
    padding: "13px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
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
    lineHeight: "1.4",
  },
  bottomText: {
    color: "#9ca3af",
    fontSize: "13px",
    textAlign: "center",
    marginTop: "22px",
  },
  link: { color: "#a78bfa", fontSize: "13px", textDecoration: "none" },
};

export default ResetPassword;
