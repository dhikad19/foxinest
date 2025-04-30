import React, { useState } from "react";
import { TextField, Button, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const WelcomePage = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   localStorage.setItem("userData", JSON.stringify(formData));
  //   navigate("/");
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // <-- panggil handler dari App
    navigate("/"); // navigasi setelah submit
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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={!formData.firstName.trim()}
        >
          Submit
        </Button>
      </form>
    </Container>
  );
};

export default WelcomePage;
