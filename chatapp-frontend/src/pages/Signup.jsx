import React, { useState } from "react";
import { MDBContainer, MDBInput, MDBBtn, MDBCard, MDBCardBody } from "mdb-react-ui-kit";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;
function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // ✅ Message State
  const [error, setError] = useState(""); // ❌ Error State
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, {
        name,
        email,
        password,
      });

      console.log("Signup Response:", response.data);

      if (response.data.success) {
        setMessage("✅ Registration successful! Redirecting...");
        setTimeout(() => {
          setMessage("");
          navigate("/");
        }, 3000); // Redirect after 3 seconds
      } else {
        setError(response.data.message || "❌ Signup failed! Please try again.");
        setTimeout(() => setError(""), 3000); // Hide error after 3 seconds
      }
    } catch (err) {
      console.error("Signup Error:", err.response?.data || err);
      setError(err.response?.data?.message || "❌ Something went wrong!");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <MDBContainer
      fluid
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: "linear-gradient(135deg, #ff758c, #ff7eb3)" }}
    >
      <MDBCard className="w-100 p-3" style={{ maxWidth: "400px", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
        <MDBCardBody>
          <h3 className="text-center text-black mb-4">Signup</h3>

          {/* ✅ Display Alert Messages as Badges */}
          {message && (
            <div className="alert alert-success text-center fw-bold py-2">{message}</div>
          )}
          {error && (
            <div className="alert alert-danger text-center fw-bold py-2">{error}</div>
          )}

          <form onSubmit={handleSignup}>
            <MDBInput
              label="Name"
              type="text"
              className="mb-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <MDBInput
              label="Email"
              type="email"
              className="mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <MDBInput
              label="Password"
              type="password"
              className="mb-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <MDBBtn className="w-100" type="submit">Signup</MDBBtn>
          </form>

          <p className="text-center text-black mt-3">
            Already have an account? <Link to="/" className="text-primary">Login here</Link>
          </p>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
}

export default Signup;
