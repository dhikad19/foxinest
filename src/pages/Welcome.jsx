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
    <Container>
      <Typography variant="h4" gutterBottom>
        Welcome! Please fill out the form to continue.
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={emailError}
          helperText={emailError ? "Please enter a valid email address" : ""}
          fullWidth
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={
            !formData.firstName.trim() || !formData.email.trim() || emailError
          }
        >
          Submit
        </Button>
      </form>
    </Container>
  );
};

export default WelcomePage;
