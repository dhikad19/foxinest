// src/pages/NotFoundPage.jsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="calc(100vh - 200px)"
      padding="0px 15px 0px 15px"
      textAlign="center"
    >
      <Typography variant="h2" color="#ff7800" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        The page you’re looking for doesn’t exist or was moved.
      </Typography>
      <Button
        size="small"
        style={{
          textTransform: "capitalize",
          fontWeight: "bold",
          fontSize: "12px",
          marginRight: "6px",
        }}
        sx={{
          backgroundColor: "#ff7800",
          "&:hover": { backgroundColor: "#ff871f" },
        }}
        disableElevation
        variant="contained"
        color="primary"
        onClick={() => navigate("/")}
      >
        Go Home
      </Button>
    </Box>
  );
};

export default NotFoundPage;
