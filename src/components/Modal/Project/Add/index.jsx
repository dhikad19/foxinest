// components/ProjectDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  OutlinedInput,
  FormControl,
  FormControlLabel,
  Switch,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  Box,
  Divider,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
const colorOptions = [
  { value: "default", label: "Default", color: "#ccc" },
  { value: "blue", label: "Blue", color: "#2196f3" },
  { value: "green", label: "Green", color: "#4caf50" },
  { value: "red", label: "Red", color: "#f44336" },
  { value: "orange", label: "Orange", color: "#ff9800" },
  { value: "purple", label: "Purple", color: "#9c27b0" },
  { value: "pink", label: "Pink", color: "#e91e63" },
  { value: "teal", label: "Teal", color: "#009688" },
];

const ProjectDialog = ({
  open,
  onClose,
  onSubmit,
  projectName,
  setProjectName,
  selectedColor,
  setSelectedColor,
  isFavorite,
  setIsFavorite,
  editProject,
}) => {
  const handleChange = (event) => {
    setSelectedColor(event.target.value);
  };

  const renderContent = () => (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <DialogTitle
          style={{ padding: "12px 24px", fontSize: 17, marginTop: 5 }}
        >
          {editProject ? "Edit Project" : "Add New Project"}
        </DialogTitle>
        <IconButton
          onClick={onClose}
          style={{ padding: "12px 19px", marginTop: 5 }}
        >
          <CloseIcon />
        </IconButton>
      </div>
      <Divider />
      <DialogContent>
        <TextField
          placeholder="Project Name"
          fullWidth
          value={projectName}
          label="Project Name"
          style={{ marginBottom: 12, marginTop: 10 }}
          sx={{
            "& label.Mui-focused": { color: "#4f4f4f" },
            "& .MuiOutlinedInput-root.Mui-focused": {
              "& fieldset": {
                borderColor: "#4f4f4f",
              },
              "& input": {
                color: "#4f4f4f",
              },
            },
          }}
          size="small"
          onChange={(e) => setProjectName(e.target.value)}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select
            value={selectedColor}
            onChange={handleChange}
            size="small"
            label="Select Color"
            displayEmpty
            input={<OutlinedInput />}
            renderValue={(value) => {
              if (!value) {
                return <span style={{ color: "#707070" }}>Select Color</span>;
              }
              const selected = colorOptions.find((c) => c.value === value);
              return (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      backgroundColor: selected?.color,
                      marginRight: 1.5,
                    }}
                  />
                  {selected?.label}
                </Box>
              );
            }}
            inputProps={{ "aria-label": "Select color" }}
          >
            <MenuItem disabled value="">
              <span style={{ color: "#4f4f4f" }}>Select Color</span>
            </MenuItem>
            {colorOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: option.color,
                    display: "inline-block",
                    marginRight: 1.5,
                  }}
                />
                <Typography variant="body2">{option.label}</Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={isFavorite}
              onChange={() => setIsFavorite(!isFavorite)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#4f4f4f",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#4f4f4f",
                },
              }}
            />
          }
          label="Add to favorite"
          sx={{
            "& .MuiFormControlLabel-label": {
              fontSize: 14,
            },
          }}
        />
      </DialogContent>
      <DialogActions style={{ paddingRight: "24px", paddingBottom: "24px" }}>
        {/* <Button
          onClick={onClose}
          sx={{ textTransform: "capitalize", color: "#ff7800" }}
        >
          Cancel
        </Button> */}
        <Button
          variant="contained"
          onClick={onSubmit}
          disableElevation
          sx={{
            backgroundColor: "#4f4f4f",
            textTransform: "capitalize",
            fontWeight: "bold",
            fontSize: "12px",
            "&:hover": {
              backgroundColor: "#4f4f4f",
            },
          }}
        >
          {editProject ? "Save Changes" : "Add Project"}
        </Button>
      </DialogActions>
    </>
  );

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return isMobile ? (
    <Drawer anchor="bottom" open={open} onClose={onClose}>
      {renderContent()}
    </Drawer>
  ) : (
    <Dialog open={open} onClose={onClose} fullWidth>
      {renderContent()}
    </Dialog>
  );
};

export default ProjectDialog;
