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
  IconButton,
  OutlinedInput,
  Box,
  Drawer,
  useTheme,
  useMediaQuery,
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
          Edit Project
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
          value={projectData.name}
          label="Project Name"
          onChange={handleChange("name")}
          fullWidth
          size="small"
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
              <span style={{ color: "#4f4f4f" }}>Select Color</span>
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
                  color: "#4f4f4f",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#4f4f4f",
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

      <DialogActions style={{ paddingRight: "24px", paddingBottom: "24px" }}>
        {/* <Button
          sx={{ textTransform: "capitalize", color: "#ff7800" }}
          onClick={onClose}
        >
          Cancel
        </Button> */}
        <Button
          sx={{
            backgroundColor: "#4f4f4f",
            textTransform: "capitalize",
            fontWeight: "bold",
            fontSize: "12px",
            "&:hover": {
              backgroundColor: "#4f4f4f",
            },
          }}
          disableElevation
          onClick={onSave}
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </>
  );

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

export default EditProjectDialog;
