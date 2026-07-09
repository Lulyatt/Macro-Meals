import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function isValidPassword(value) {
    return value.length >= 8 && /[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords must match.");
      setLoading(false);
      return;
    }

    if (!isValidPassword(password)) {
      setError("Password must be at least 8 characters long and include a number and a special character.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccess("Registration complete. You can now log in.");
      setLoading(false);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      navigate("/login");
    } catch (err) {
      setError("Unable to connect to the server.");
      setLoading(false);
    }
  }

  const passwordRules = [
    { label: "Minimum 8 characters", valid: password.length >= 8 },
    { label: "Contains a number", valid: /[0-9]/.test(password) },
    { label: "Contains a special character", valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const passwordValid = passwordRules.every((rule) => rule.valid);
  const passwordsMatch = password !== "" && password === confirmPassword;
  const canSubmit = email.trim() !== "" && passwordValid && passwordsMatch && !loading;

  return (
    <div style={{ padding: "20px", maxWidth: "420px", margin: "0 auto" }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "12px" }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label htmlFor="password">Password</label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#2563eb",
                fontWeight: 600,
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div style={{ display: "grid", gap: "6px", marginTop: "8px" }}>
            {passwordRules.map((rule) => (
              <div key={rule.label} style={{ display: "flex", alignItems: "center", gap: "8px", color: rule.valid ? "#166534" : "#4b5563" }}>
                <span>{rule.valid ? "✅" : "◻"}</span>
                <span style={{ fontSize: "0.9rem" }}>{rule.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label htmlFor="confirmPassword">Confirm password</label>
          <div style={{ position: "relative" }}>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#2563eb",
                fontWeight: 600,
              }}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: passwordsMatch ? "#166534" : "#4b5563", marginTop: "8px" }}>
            <span>{passwordsMatch ? "✅" : "◻"}</span>
            {passwordsMatch ? "Passwords match" : "Passwords must match"}
          </p>
        </div>

        <button type="submit" disabled={!canSubmit}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "16px" }}>{error}</p>
      )}
      {success && (
        <p style={{ color: "green", marginTop: "16px" }}>{success}</p>
      )}

      <p style={{ marginTop: "16px" }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
