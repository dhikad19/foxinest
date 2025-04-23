// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light", // change to 'dark' for dark mode
    primary: {
      main: "#1976d2", // customize your primary color
    },
    secondary: {
      main: "#f50057",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial",
  },
});

export default theme;
