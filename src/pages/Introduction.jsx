import React, { useState } from "react";
import { useHistory } from "react-router-dom";

const IntroductionPage = () => {
  const [name, setName] = useState("");
  const history = useHistory();

  const handleSubmit = () => {
    if (name.trim()) {
      // Save data in localStorage
      localStorage.setItem("user_data", JSON.stringify({ name }));

      // After storing data, redirect to home page
      history.push("/home");
    } else {
      alert("Please enter your name.");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Welcome to Our App!</h1>
      <p>Please tell us your name:</p>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "8px", fontSize: "16px", marginBottom: "20px" }}
      />
      <br />
      <button
        onClick={handleSubmit}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Submit
      </button>
    </div>
  );
};

export default IntroductionPage;
