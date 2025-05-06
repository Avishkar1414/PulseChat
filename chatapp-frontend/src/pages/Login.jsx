import React, { useState } from "react";
import { MDBInput, MDBBtn, MDBCard, MDBCardBody } from "mdb-react-ui-kit";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import './Login.css';  // Import your CSS file
const API_URL = process.env.REACT_APP_API_URL;
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // ✅ Success Message
  const [error, setError] = useState(""); // ❌ Error Message
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      console.log("Login Response:", response.data);

      if (response.data.success) {
        setMessage("✅ Login successful! Redirecting...");

        // ✅ Store user data in localStorage
        localStorage.setItem("userId", response.data.userId);
        localStorage.setItem("token", response.data.token);

        setTimeout(() => {
          setMessage("");
          navigate("/chat"); // ✅ Redirect to Chat Page
        }, 2000); // Redirect after 2 seconds
      } else {
        setError(response.data.message || "❌ Login failed! Please check your credentials.");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data || err);
      setError(err.response?.data?.message || "❌ Invalid credentials!");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="login-page">
      <MDBCard className="card">
        <MDBCardBody>
          <div className="text-center mb-4">
            <img
              src="./assets/Pulse_chat.png"
              alt="PulseChat Logo"
              style={{
                width: "120px",
                height: "auto",
                filter: "drop-shadow(0px 0px 10px #8E75FF)",
                borderRadius: "50%",
              }}
            />
          </div>
          <h3 className="text-center mb-4">Login</h3>

          {/* ✅ Success & Error Messages */}
          {message && <div className="alert alert-success text-center fw-bold py-2">{message}</div>}
          {error && <div className="alert alert-danger text-center fw-bold py-2">{error}</div>}

          <form onSubmit={handleLogin}>
            <MDBInput
              label="Email"
              type="email"
              className="form-control mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <MDBInput
              label="Password"
              type="password"
              className="form-control mb-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* ✅ Forgot Password Link */}
            <p className="text-center">
              <Link to="/forgot-password" className="text-light">Forgot Password?</Link>
            </p>

            <MDBBtn className="btn-dark bg-dark text-light w-100" type="submit">Login</MDBBtn>
          </form>

          <p className="text-center mt-3">
            Don't have an account? <Link to="/signup" className="text-light"><u>Sign up here</u></Link>
          </p>
        </MDBCardBody>
      </MDBCard>
    </div>
  );
}

export default Login;
