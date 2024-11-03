import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Snackbar, Alert, Box, Card, CardContent, CardActions, } from "@mui/material";
import { useGameContext } from "./GameContext";
const EditGame = () => {
    const { id } = useParams(); // Get ID from the URL
    const { gameInstances, addGame } = useGameContext(); // Use addGame for saving a new instance
    const navigate = useNavigate();
    const [gameData, setGameData] = useState({
        category_name: "",
        instance_name: "",
        price_per_hour: 0,
    });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [message, setMessage] = useState("");
    const [isFormLoaded, setIsFormLoaded] = useState(false); // Track if form is initially loaded
    // Fetch the game instance based on the ID and populate the form
    useEffect(() => {
        if (!isFormLoaded && id) {
            const gameInstance = gameInstances.find((inst) => inst.id === Number(id));
            if (gameInstance) {
                setGameData({
                    category_name: gameInstance.category_name,
                    instance_name: gameInstance.instance_name,
                    price_per_hour: gameInstance.price_per_hour,
                });
            }
            setIsFormLoaded(true); // Mark form as loaded after setting initial data
        }
    }, [id, gameInstances, isFormLoaded]);
    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setGameData((prevData) => ({
            ...prevData,
            [name]: name === "price_per_hour" ? parseFloat(value) : value,
        }));
    };
    // Handle saving new game instance
    const handleSave = async () => {
        try {
            await addGame(gameData.category_name, gameData.instance_name, gameData.price_per_hour); // Add new game instance
            setMessage("New game instance created successfully!");
            setOpenSnackbar(true);
            // Redirect to home page after saving
            setTimeout(() => {
                navigate("/");
            }, 2000);
        }
        catch (error) {
            if (error instanceof Error) {
                alert("Failed to create game: " + error.message);
            }
        }
    };
    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };
    const handleBack = () => {
        navigate(-1);
    };
    return (_jsxs(Container, { maxWidth: "sm", sx: { mt: 4 }, children: [_jsxs(Card, { variant: "outlined", children: [_jsxs(CardContent, { children: [_jsx(Typography, { variant: "h5", gutterBottom: true, align: "center", children: "Edit Game" }), _jsxs(Box, { display: "flex", flexDirection: "column", alignItems: "center", children: [_jsx(TextField, { label: "Category Name", name: "category_name", value: gameData.category_name, onChange: handleChange, fullWidth: true, disabled: true, margin: "normal", variant: "outlined" }), _jsx(TextField, { label: "Instance Name", name: "instance_name", value: gameData.instance_name, disabled: true, onChange: handleChange, fullWidth: true, margin: "normal", variant: "outlined" }), _jsx(TextField, { label: "Price per Hour (\u20AC)", name: "price_per_hour", value: gameData.price_per_hour || "", onChange: handleChange, type: "number", fullWidth: true, margin: "normal", variant: "outlined" })] })] }), _jsxs(CardActions, { sx: { justifyContent: "flex-end" }, children: [_jsx(Button, { variant: "contained", color: "primary", onClick: handleSave, children: "Save" }), _jsx(Button, { variant: "outlined", color: "secondary", onClick: handleBack, sx: { ml: 2 }, children: "Back" })] })] }), _jsx(Snackbar, { open: openSnackbar, autoHideDuration: 6000, onClose: handleSnackbarClose, children: _jsx(Alert, { onClose: handleSnackbarClose, severity: "success", children: message }) })] }));
};
export default EditGame;
