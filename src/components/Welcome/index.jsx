import React, { useState } from "react";
import { TextField, Button, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const WelcomePage = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [emailError, setEmailError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(!emailRegex.test(value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    navigate("/");
  };

  return (
    <>
      <img
        src="/foxinest.png"
        style={{
          objectFit: "contain",
          maxWidth: 40,
          marginTop: "20px",
          marginLeft: "20px",
        }}
        alt=""
      />
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "15px" }}>
        <Typography
          variant="h5"
          gutterBottom
          style={{
            textAlign: "center",
            fontWeight: 500,
            marginTop: "55px",
            fontSize: "20px",
            marginBottom: "30px",
          }}
        >
          Welcome! <br /> Please fill out the form to continue.
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            size="small"
            margin="dense"
            sx={{
              "& label.Mui-focused": { color: "#ff7800" },
              "& .MuiOutlinedInput-root.Mui-focused": {
                "& fieldset": {
                  borderColor: "#ff7800",
                },
                "& input": {
                  color: "#ff7800",
                },
              },
            }}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            fullWidth
            size="small"
            margin="dense"
            sx={{
              "& label.Mui-focused": { color: "#ff7800" },
              "& .MuiOutlinedInput-root.Mui-focused": {
                "& fieldset": {
                  borderColor: "#ff7800",
                },
                "& input": {
                  color: "#ff7800",
                },
              },
            }}
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={emailError}
            helperText={emailError ? "Please enter a valid email address" : ""}
            fullWidth
            size="small"
            margin="dense"
            sx={{
              "& label.Mui-focused": { color: "#ff7800" },
              "& .MuiOutlinedInput-root.Mui-focused": {
                "& fieldset": {
                  borderColor: "#ff7800",
                },
                "& input": {
                  color: "#ff7800",
                },
              },
            }}
          />
          <p
            style={{
              fontSize: "14px",
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            By using this app, you acknowledge that data is currently stored
            locally via localStorage. Backend development is still in progress.
          </p>
          <Button
            type="submit"
            size="large"
            variant="contained"
            sx={{
              marginTop: "20px",
              textTransform: "capitalize",
              backgroundColor: "#ff7800",
              boxShadow: "none", // removes shadow
              "&:hover": {
                backgroundColor: "#e06f00",
                boxShadow: "none", // removes shadow on hover too
              },
            }}
            fullWidth
            disabled={
              !formData.firstName.trim() || !formData.email.trim() || emailError
            }
          >
            Continue
          </Button>
        </form>
      </div>
    </>
  );
};

export default WelcomePage;
