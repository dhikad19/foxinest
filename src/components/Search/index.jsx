import React from "react";
import TextField from "@mui/material/TextField";

const SearchBar = ({ query, setQuery }) => (
  <TextField
    fullWidth
    variant="outlined"
    placeholder="Search title or category"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    margin="dense"
    size="small"
    sx={{
      mb: 2,
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#ccc", // Default border color
        },
        "&:hover fieldset": {
          borderColor: "#ff7800", // Hover border color
        },
        "&.Mui-focused fieldset": {
          borderColor: "#ff7800", // Focus border color
        },
      },
    }}
  />
);

export default SearchBar;
