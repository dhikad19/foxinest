import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BRAND = "#0066FF";
const BRAND_DARK = "#004ec4";

const fieldSx = {
  "& .MuiInputBase-input": {
    fontSize: { xs: 16, sm: 14 }, // 16px mencegah auto-zoom di iOS
  },
  "& label.Mui-focused": { color: BRAND },
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&.Mui-focused fieldset": { borderColor: BRAND },
  },
};

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
      setEmailError(value !== "" && !emailRegex.test(value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    navigate("/");
  };

  return (
    <div>
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 3 },
          py: { xs: 3, sm: 6 },
          background: "linear-gradient(180deg, #bed8ff 0%, #ffffff 60%)",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "calc(100% - 32px)",
            maxWidth: 440,
            p: { xs: 3, sm: 5 },
            borderRadius: { xs: 3, sm: 4 },

            boxShadow: { xs: "none", sm: "0 8px 30px #0066ff2d" },
          }}
        >
          <Stack alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Trail"
              sx={{
                width: { xs: 44, sm: 52 },
                height: "auto",
                objectFit: "contain",
              }}
            />
            <Typography
              variant="h5"
              sx={{
                textAlign: "center",
                fontWeight: 600,
                fontSize: { xs: 22, sm: 24 },
                lineHeight: 1.3,
              }}
            >
              Welcome to{" "}
              <Box component="span" sx={{ color: BRAND }}>
                Trail
              </Box>
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              Please fill out the form to continue.
            </Typography>
          </Stack>

          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                  size="medium"
                  fullWidth
                  required
                  sx={fieldSx}
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                  size="medium"
                  fullWidth
                  sx={fieldSx}
                />
              </Stack>

              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                size="medium"
                error={emailError}
                helperText={
                  emailError ? "Please enter a valid email address" : ""
                }
                autoComplete="email"
                fullWidth
                required
                sx={fieldSx}
              />

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  textAlign: "center",
                  px: { xs: 0, sm: 1 },
                }}
              >
                By using this app, you acknowledge that data is currently stored
                locally via localStorage. Backend development is still in
                progress.
              </Typography>

              <Button
                type="submit"
                size="medium"
                variant="contained"
                fullWidth
                disabled={
                  !formData.firstName.trim() ||
                  !formData.email.trim() ||
                  emailError
                }
                sx={{
                  minHeight: 48,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  backgroundColor: BRAND,
                  boxShadow: "none",
                  "&:hover": { backgroundColor: BRAND_DARK, boxShadow: "none" },
                }}
              >
                Continue
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </div>
  );
};

export default WelcomePage;
