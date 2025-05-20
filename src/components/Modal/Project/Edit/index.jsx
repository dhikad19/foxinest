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
} from "@mui/material";

const EditProjectDialog = ({
  open,
  onClose,
  onSave,
  projectData,
  setProjectData,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Project</DialogTitle>
      <DialogContent>
        <TextField
          label="Project Name"
          value={projectData.name}
          onChange={(e) =>
            setProjectData((prev) => ({ ...prev, name: e.target.value }))
          }
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <Select
            value={projectData.color}
            onChange={(e) =>
              setProjectData((prev) => ({ ...prev, color: e.target.value }))
            }
            displayEmpty
          >
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="blue">Blue</MenuItem>
            <MenuItem value="green">Green</MenuItem>
            <MenuItem value="red">Red</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={projectData.isFavorite || false}
              onChange={(e) =>
                setProjectData((prev) => ({
                  ...prev,
                  isFavorite: e.target.checked,
                }))
              }
            />
          }
          label="Favorite"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProjectDialog;
