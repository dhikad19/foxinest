import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

const DeleteProjectDialog = ({ open, onClose, onDelete }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontSize: 18 }}>Delete Project</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this project? This action cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: "capitalize", color: "#0066FF" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onDelete}
          disableElevation
          sx={{
            backgroundColor: "#0066FF",
            textTransform: "capitalize",
            fontWeight: "bold",
            fontSize: "12px",
            "&:hover": {
              backgroundColor: "#004ec2",
            },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteProjectDialog;
