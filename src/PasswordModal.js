import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from "@mui/material";
const PasswordModal = ({ open, onClose, onLogin }) => {
    const [password, setPassword] = useState("");
    const handleLogin = () => {
        if (password === "0000") {
            onLogin();
        }
        else {
            alert("Incorrect password. Please try again.");
        }
    };
    return (_jsxs(Dialog, { open: open, onClose: onClose, children: [_jsx(DialogTitle, { children: "Admin Login" }), _jsx(DialogContent, { children: _jsx(TextField, { autoFocus: true, margin: "dense", label: "Password", type: "password", fullWidth: true, variant: "outlined", value: password, onChange: (e) => setPassword(e.target.value) }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: onClose, color: "primary", children: "Cancel" }), _jsx(Button, { onClick: handleLogin, color: "primary", children: "Login" })] })] }));
};
export default PasswordModal;
