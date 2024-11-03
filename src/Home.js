import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton, Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useGameContext } from "./GameContext";
import { invoke } from "@tauri-apps/api/tauri";
import './Home.css'; // Adjust the path if your CSS file is in a different folder
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
const Home = () => {
    const { gameInstances, setGameInstances, startGame, resetGame, finishGame, deleteGame, } = useGameContext();
    const navigate = useNavigate();
    // State variables
    const [anchorEl, setAnchorEl] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [message, setMessage] = useState("");
    const [openFinishDialog, setOpenFinishDialog] = useState(false); // State for finish confirmation dialog
    const [selectedInstanceId, setSelectedInstanceId] = useState(null); // Store the selected instance ID for finishing
    const [openDialog, setOpenDialog] = useState(false);
    const [password, setPassword] = useState("");
    const [redirectToAnalytics, setRedirectToAnalytics] = useState(false);
    const [redirectToProperties, setRedirectToProperties] = useState(false);
    const getTimerFromLocalStorage = (instanceId) => {
        return localStorage.getItem(instanceId); // returns the timestamp string or null
    };
    // Utility function to calculate total cost
    const calculateTotalCost = (elapsedTime, pricePerHour) => {
        return (elapsedTime / 3600000) * pricePerHour; // Convert milliseconds to hours and multiply by price per hour
    };
    // Fetch games on mount
    useEffect(() => {
        const fetchGames = async () => {
            try {
                // Fetch game instances
                const fetchedInstances = (await invoke("get_game_instances")) || [];
                // Map over fetched instances to set end_time, total_cost, elapsed_time, and update with local storage timers
                const initializedInstances = fetchedInstances.map((instance) => {
                    const storedStartTime = getTimerFromLocalStorage(instance.id.toString()); // Get the timer for this instance by ID
                    if (storedStartTime) {
                        const startTimeDate = new Date(storedStartTime).getTime(); // Convert to timestamp
                        const startTime = storedStartTime;
                        const now = Date.now(); // Current time
                        const elapsedTime = now - startTimeDate; // Calculate elapsed time in milliseconds
                        return {
                            ...instance,
                            end_time: null, // Set as needed
                            start_time: startTime,
                            total_cost: calculateTotalCost(elapsedTime, instance.price_per_hour), // Recalculate total cost based on elapsed time
                            elapsed_time: elapsedTime, // Set elapsed time
                        };
                    }
                    // Return instance with default values if no stored start time
                    return {
                        ...instance,
                        end_time: null,
                        start_time: null,
                        total_cost: 0,
                        elapsed_time: 0,
                    };
                });
                // Set fetched game instances
                setGameInstances(initializedInstances);
            }
            catch (error) {
                console.error("Failed to fetch game instances:", error);
                showSnackbar("Error: Failed to fetch game instances.");
            }
        };
        fetchGames();
    }, [setGameInstances]);
    const showSnackbar = (msg) => {
        setMessage(msg);
        setOpenSnackbar(true);
    };
    // Menu handling
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    // Dialog handling
    const handleCreateCategoryClick = () => {
        setAnchorEl(null);
        setOpenDialog(true);
        setRedirectToAnalytics(false);
        setRedirectToProperties(false);
    };
    const handleDialogClose = () => {
        setOpenDialog(false);
        setPassword(""); // Clear password field
    };
    const handlePasswordSubmit = () => {
        const correctPassword = "0000"; // Replace with your actual password
        if (password === correctPassword) {
            handleDialogClose();
            if (redirectToProperties) {
                navigate("/options");
                return;
            }
            navigate(redirectToAnalytics ? "/analytics" : "/create-category");
        }
        else {
            showSnackbar("Incorrect password.");
        }
    };
    const handleAnalyticsClick = () => {
        setAnchorEl(null);
        setOpenDialog(true);
        setRedirectToAnalytics(true);
        setRedirectToProperties(false);
    };
    const handlePropertiesClick = () => {
        setAnchorEl(null);
        setOpenDialog(true);
        setRedirectToProperties(true);
    };
    const formatTime = (elapsed) => {
        const hours = Math.floor(elapsed / 3600).toString().padStart(2, "0");
        const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, "0");
        const seconds = (elapsed % 60).toString().padStart(2, "0");
        return `${hours}:${minutes}:${seconds}`;
    };
    // Handle Finish dialog open
    const handleFinishDialogOpen = (instanceId) => {
        setSelectedInstanceId(instanceId);
        setOpenFinishDialog(true);
    };
    // Handle Finish dialog close
    const handleFinishDialogClose = () => {
        setOpenFinishDialog(false);
        setSelectedInstanceId(null);
    };
    // Confirm finish game instance
    const handleFinishConfirm = async () => {
        if (selectedInstanceId === null)
            return;
        const instance = gameInstances.find((inst) => inst.id === selectedInstanceId);
        if (!instance) {
            showSnackbar("Error: Could not find the game instance.");
            handleFinishDialogClose();
            return;
        }
        // Validate required fields before saving
        if (!instance.category_name ||
            !instance.instance_name ||
            instance.price_per_hour <= 0 ||
            (instance.elapsed_time !== null && instance.elapsed_time < 0) || // Check for null first
            instance.total_cost < 0 ||
            !instance.start_time) {
            showSnackbar("Nothing to save: Missing required fields.");
            handleFinishDialogClose();
            return;
        }
        try {
            await finishGame(selectedInstanceId); // Call the finishGame function
            resetGame(selectedInstanceId); // Reset the game after finishing
            showSnackbar("Game saved successfully!");
        }
        catch (error) {
            console.error("Error saving game:", error);
            showSnackbar("Error: Failed to save game.");
        }
        handleFinishDialogClose(); // Close the dialog after finishing
    };
    // Snackbar handling
    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };
    return (_jsxs("div", { children: [_jsx(AppBar, { position: "static", children: _jsxs(Toolbar, { children: [_jsx(IconButton, { edge: "start", color: "inherit", "aria-label": "menu", onClick: handleMenuClick, children: _jsx(MenuIcon, { titleAccess: "Menu" }) }), _jsxs(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, children: [_jsx(MenuItem, { onClick: handleCreateCategoryClick, children: "Create New Category" }), _jsx(MenuItem, { onClick: handleAnalyticsClick, children: "Analytics" }), _jsx(MenuItem, { onClick: handlePropertiesClick, children: "Settings" })] })] }) }), _jsx(Container, { children: gameInstances.length > 0 ? (_jsx(TableContainer, { component: Paper, style: { marginTop: '10px' }, children: _jsx("div", { style: { backgroundColor: 'white' }, children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { style: {}, children: [_jsx(TableCell, { style: { fontWeight: 'bold', backgroundColor: '#f7eded' }, children: "\u039A\u03B1\u03C4\u03B7\u03B3\u03BF\u03C1\u03AF\u03B1" }), _jsx(TableCell, { style: { fontWeight: 'bold', backgroundColor: '#f7eded' }, children: "\u039F\u03BD\u03BF\u03BC\u03B1" }), _jsx(TableCell, { style: { fontWeight: 'bold', backgroundColor: '#f7eded' }, children: "\u039E\u03B5\u03BA\u03B7\u03BD\u03C3\u03B5" }), _jsx(TableCell, { style: { fontWeight: 'bold', backgroundColor: '#f7eded' }, children: "\u03A4\u03B5\u03BB\u03B5\u03B9\u03C9\u03C3\u03B5" }), _jsx(TableCell, { style: { fontWeight: 'bold', backgroundColor: '#f7eded' }, children: "\u03A3\u03C5\u03BD\u03BF\u03BB\u03C5\u03BA\u03BF \u03BA\u03BF\u03C3\u03C4\u03BF\u03C2 (\u20AC)" }), _jsx(TableCell, { style: { fontWeight: 'bold', backgroundColor: '#f7eded' }, children: "\u0395\u03BD\u03B5\u03C1\u03B3\u03B5\u03B9\u03B5\u03C2" })] }) }), _jsx(TableBody, { children: gameInstances.map((instance) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: instance.category_name }), _jsx(TableCell, { children: instance.instance_name }), _jsx(TableCell, { children: instance.start_time ? new Date(instance.start_time).toLocaleTimeString() : "-" }), _jsx(TableCell, { children: instance.elapsed_time ? formatTime(instance.elapsed_time) : "-" }), _jsx(TableCell, { children: instance.total_cost.toFixed(2) }), _jsx(TableCell, { children: _jsxs(Grid, { container: true, spacing: 0.5, children: [_jsx(Grid, { item: true, children: _jsx(Tooltip, { title: "Start", children: _jsx(IconButton, { color: "success", onClick: () => startGame(instance.id), children: _jsx(PlayArrowIcon, {}) }) }) }), _jsx(Grid, { item: true, children: _jsx(Tooltip, { title: "Reset", children: _jsx(IconButton, { color: "primary", onClick: () => resetGame(instance.id), children: _jsx(RestartAltIcon, {}) }) }) }), _jsx(Grid, { item: true, children: _jsx(Tooltip, { title: "Finish", children: _jsx(IconButton, { color: "primary", disabled: instance.total_cost <= 0, onClick: () => handleFinishDialogOpen(instance.id), children: _jsx(CheckCircleIcon, {}) }) }) })] }) })] }, `instance-${instance.id}`))) })] }) }) })) : (_jsx(Typography, { variant: "h6", style: { marginTop: "20px" }, children: "No game instances available." })) }), _jsx(Snackbar, { open: openSnackbar, autoHideDuration: 6000, onClose: handleSnackbarClose, children: _jsx(Alert, { onClose: handleSnackbarClose, severity: "info", icon: _jsx(CheckCircleIcon, {}), children: message }) }), _jsxs(Dialog, { open: openFinishDialog, onClose: handleFinishDialogClose, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: _jsxs(Typography, { variant: "h6", style: { display: 'flex', alignItems: 'center' }, children: [_jsx(CheckCircleIcon, { color: "success", style: { marginRight: 8 } }), "Confirm Finish Game"] }) }), _jsx(DialogContent, { children: selectedInstanceId !== null && (_jsxs("div", { style: { padding: '20px' }, children: [_jsxs(Typography, { variant: "subtitle1", gutterBottom: true, children: [_jsx("strong", { children: "Game Name:" }), " ", gameInstances.find((inst) => inst.id === selectedInstanceId)?.instance_name] }), _jsxs(Typography, { variant: "subtitle1", gutterBottom: true, children: [_jsx("strong", { children: "Category:" }), " ", gameInstances.find((inst) => inst.id === selectedInstanceId)?.category_name] }), _jsxs(Typography, { variant: "subtitle1", gutterBottom: true, children: [_jsx("strong", { children: "Time Played:" }), " ", formatTime(gameInstances.find((inst) => inst.id === selectedInstanceId)?.elapsed_time || 0)] }), _jsxs(Typography, { variant: "subtitle1", gutterBottom: true, children: [_jsx("strong", { children: "Total Cost (\u20AC):" }), " ", gameInstances.find((inst) => inst.id === selectedInstanceId)?.total_cost.toFixed(2)] }), _jsxs(Typography, { variant: "subtitle1", gutterBottom: true, children: [_jsx("strong", { children: "Started At:" }), " ", new Date(gameInstances.find((inst) => inst.id === selectedInstanceId)?.start_time || "").toLocaleString()] })] })) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleFinishDialogClose, color: "secondary", children: "Cancel" }), _jsx(Button, { onClick: handleFinishConfirm, color: "primary", variant: "contained", children: "Yes, Finish Game" })] })] }), _jsxs(Dialog, { open: openDialog, onClose: handleDialogClose, children: [_jsx(DialogTitle, { children: "Enter Password" }), _jsx(DialogContent, { children: _jsx(TextField, { autoFocus: true, margin: "dense", label: "Password", type: "password", fullWidth: true, variant: "outlined", value: password, onChange: (e) => setPassword(e.target.value) }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleDialogClose, color: "primary", children: "Cancel" }), _jsx(Button, { onClick: handlePasswordSubmit, color: "primary", children: "Submit" })] })] })] }));
};
export default Home;
