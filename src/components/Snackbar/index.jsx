import React, { useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const Snackbar = ({ message, onUndo }) => {
  useEffect(() => {
    toast.info(
      <div>
        testaja
        <button
          onClick={onUndo}
          style={{
            marginLeft: "10px",
            background: "none",
            border: "none",
            color: "#007bff",
            cursor: "pointer",
          }}
        >
          Undo
        </button>
      </div>,
      {
        className: "custom-toast",
        progressClassName: "custom-toast-progress",
        icon: (
          <div>
            <InfoOutlinedIcon style={{ color: "#ff7800" }} />
          </div>
        ),
        position: toast.POSITION.BOTTOM_LEFT,
        autoClose: 5000,
        closeOnClick: true,
      }
    );
  }, [message, onUndo]);

  return null; // React-Toastify manages the UI
};

export default Snackbar;
