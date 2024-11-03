import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from "@mui/material";

interface PasswordModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ open, onClose, onLogin }) => {
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (password === "0000") {
      onLogin();
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Admin Login</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Password"
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleLogin} color="primary">
          Login
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordModal;
