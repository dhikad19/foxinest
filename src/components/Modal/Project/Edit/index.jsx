import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  Switch,
  OutlinedInput,
  Box,
  Typography,
} from "@mui/material";

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

const EditProjectDialog = ({
  open,
  onClose,
  onSave,
  projectData,
  setProjectData,
}) => {
  const handleChange = (field) => (event) => {
    const value =
      field === "isFavorite" ? event.target.checked : event.target.value;
    setProjectData((prev) => ({ ...prev, [field]: value }));
  };

  const renderColorValue = (value) => {
    if (!value) return <em style={{ color: "#aaa" }}>Select a color</em>;

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
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontSize: 18 }}>Edit Project</DialogTitle>

      <DialogContent>
        <TextField
          placeholder="Project Name"
          value={projectData.name}
          onChange={handleChange("name")}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select
            value={projectData.color || ""}
            onChange={handleChange("color")}
            size="small"
            displayEmpty
            input={<OutlinedInput />}
            renderValue={renderColorValue}
            inputProps={{ "aria-label": "Select color" }}
          >
            <MenuItem disabled value="">
              <em>Select a color</em>
            </MenuItem>
            {colorOptions.map(({ value, label, color }) => (
              <MenuItem key={value} value={value}>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: color,
                    display: "inline-block",
                    marginRight: 1.5,
                  }}
                />
                <Typography variant="body2">{label}</Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={projectData.isFavorite || false}
              onChange={handleChange("isFavorite")}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#ff7800",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#ff7800",
                },
              }}
            />
          }
          label="Favorite"
          sx={{
            "& .MuiFormControlLabel-label": {
              fontSize: 14,
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          sx={{ textTransform: "capitalize", color: "#ff7800" }}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          sx={{
            backgroundColor: "#ff7800",
            textTransform: "capitalize",
            fontWeight: "bold",
            fontSize: "12px",
            "&:hover": {
              backgroundColor: "#ff871f",
            },
          }}
          disableElevation
          onClick={onSave}
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProjectDialog;
