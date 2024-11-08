import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameContext } from "./GameContext";
import { Container, TextField, Button, Typography, Box, Paper, Snackbar, // Import Snackbar
 } from "@mui/material";
// Enum for predefined categories
const GameCategories = {
    BILLIARDS: "Billiards",
    POOL: "Pool",
    SNOOKER: "Snooker",
    CUSTOM: "Custom", // New Custom option
};
const CreateCategory = () => {
    const [category, setCategory] = useState(GameCategories.BILLIARDS); // Default to Billiards
    const [customCategory, setCustomCategory] = useState(""); // New state for custom category input
    const [instanceName, setInstanceName] = useState("");
    const [pricePerHour, setPricePerHour] = useState("");
    const { addGame } = useGameContext(); // Assume this is adjusted for adding games
    const navigate = useNavigate();
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [message, setMessage] = useState("");
    const showSnackbar = (msg) => {
        setMessage(msg);
        setOpenSnackbar(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const price = parseFloat(pricePerHour);
        // Validate the input fields
        if (!instanceName || isNaN(price) || price <= 0) {
            alert("Please fill in all fields with valid values.");
            return; // Don't proceed if validation fails
        }
        // If 'Custom' is selected, use the custom category input
        const selectedCategory = category === GameCategories.CUSTOM ? customCategory : category;
        if (!selectedCategory) {
            alert("Please enter a valid category.");
            return;
        }
        try {
            // Call the addGame function to save to the database
            await addGame(selectedCategory, instanceName, price);
            showSnackbar("Game saved successfully!"); // Show snackbar instead of alert
        }
        catch (error) {
            if (error instanceof Error) {
                alert("Failed to create game: " + error.message); // Handle errors with a message
            }
            else {
                alert("Failed to create game: An unknown error occurred."); // Handle unknown errors
            }
        }
    };
    return (_jsx(Container, { maxWidth: "sm", children: _jsxs(Paper, { elevation: 3, sx: { p: 4, mt: 5 }, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, children: "\u0394\u03B9\u03BC\u03B7\u03BF\u03C5\u03C1\u03B3\u03B7\u03C3\u03B5 \u03BD\u03B5\u03B1 \u03BA\u03B1\u03C4\u03B7\u03B3\u03BF\u03C1\u03B9\u03B1" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx(Box, { mb: 3, children: _jsx(TextField, { select: true, label: "Category", fullWidth: true, value: category, onChange: (e) => setCategory(e.target.value), required: true, SelectProps: {
                                    native: true,
                                }, children: Object.entries(GameCategories).map(([key, value]) => (_jsx("option", { value: value, children: value }, key))) }) }), category === GameCategories.CUSTOM && (_jsx(Box, { mb: 3, children: _jsx(TextField, { label: "Custom Category", fullWidth: true, value: customCategory, onChange: (e) => setCustomCategory(e.target.value), required: true }) })), _jsx(Box, { mb: 3, children: _jsx(TextField, { label: "Instance Name", fullWidth: true, value: instanceName, onChange: (e) => setInstanceName(e.target.value), required: true }) }), _jsx(Box, { mb: 3, children: _jsx(TextField, { label: "Price per Hour (\u20AC)", type: "number", fullWidth: true, value: pricePerHour, onChange: (e) => setPricePerHour(e.target.value), required: true }) }), _jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 3, children: [_jsx(Button, { variant: "outlined", color: "secondary", onClick: () => navigate("/"), sx: { flexGrow: 1, marginRight: 1 }, children: "Back" }), _jsx(Button, { variant: "contained", color: "primary", type: "submit", sx: { flexGrow: 1 }, children: "Create Game" })] })] }), _jsx(Snackbar, { open: openSnackbar, autoHideDuration: 6000, onClose: () => setOpenSnackbar(false), message: message })] }) }));
};
export default CreateCategory;
