import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toolbar, Typography, Button, IconButton, Container, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CategoryIcon from "@mui/icons-material/Category";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useGameContext } from "./GameContext";
import { invoke } from "@tauri-apps/api/tauri";
import './Home.css'; // Adjust the path if your CSS file is in a different folder
const Home = () => {
    const { gameInstances, setGameInstances, startGame, resetGame, finishGame, deleteGame, } = useGameContext();
    const navigate = useNavigate();
    // State variables
    const [anchorEl, setAnchorEl] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [message, setMessage] = useState("");
    const [openFinishDialog, setOpenFinishDialog] = useState(false);
    const [selectedInstanceId, setSelectedInstanceId] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [password, setPassword] = useState("");
    const [redirectToAnalytics, setRedirectToAnalytics] = useState(false);
    const [redirectToProperties, setRedirectToProperties] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    // Prevents UI from right clicked so user cant press right  click back and go back to analytics
    //   useEffect(() => {
    //     const handleContextmenu = (e: MouseEvent) => {
    //         e.preventDefault();
    //     };
    //     document.addEventListener('contextmenu', handleContextmenu);
    //     return function cleanup() {
    //         document.removeEventListener('contextmenu', handleContextmenu);
    //     };
    // }, []);
    const getTimerFromLocalStorage = (instanceId) => {
        return localStorage.getItem(instanceId);
    };
    const calculateTotalCost = (elapsedTime, pricePerHour) => {
        return (elapsedTime / 3600000) * pricePerHour;
    };
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const fetchedInstances = (await invoke("get_game_instances")) || [];
                const initializedInstances = fetchedInstances.map((instance) => {
                    const storedStartTime = getTimerFromLocalStorage(instance.id.toString());
                    if (storedStartTime) {
                        const startTimeDate = new Date(storedStartTime).getTime();
                        const startTime = storedStartTime;
                        const now = Date.now();
                        const elapsedTime = now - startTimeDate;
                        return {
                            ...instance,
                            end_time: null,
                            start_time: startTime,
                            total_cost: calculateTotalCost(elapsedTime, instance.price_per_hour),
                            elapsed_time: elapsedTime,
                        };
                    }
                    return {
                        ...instance,
                        end_time: null,
                        start_time: null,
                        total_cost: 0,
                        elapsed_time: 0,
                    };
                });
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
    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };
    const handleNavigate = (path) => {
        navigate(path);
        setDrawerOpen(false);
        handleCreateCategoryClick();
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
    //Enable for dialog Pop Up on save
    // const handleFinishDialogOpen = (instanceId: number) => {
    //   setSelectedInstanceId(instanceId);
    //   setOpenFinishDialog(true);
    // };
    //Enable for dialog Pop Up on save
    // const handleFinishDialogClose = () => {
    //   setOpenFinishDialog(false);
    //   setSelectedInstanceId(null);
    // };
    const handleFinishConfirm = async (selectedInstanceId) => {
        if (selectedInstanceId === null)
            return;
        const instance = gameInstances.find((inst) => inst.id === selectedInstanceId);
        if (!instance) {
            showSnackbar("Error: game instance is empty.");
            return;
        }
        if (!instance.category_name ||
            !instance.instance_name ||
            instance.price_per_hour <= 0 ||
            (instance.elapsed_time !== null && instance.elapsed_time < 0) ||
            instance.total_cost < 0 ||
            !instance.start_time) {
            showSnackbar("Nothing to save: Missing required fields.");
            return;
        }
        try {
            await finishGame(selectedInstanceId);
            // resetGame(selectedInstanceId);
            showSnackbar("Game saved successfully!");
        }
        catch (error) {
            console.error("Error saving game:", error);
            showSnackbar("Error: Failed to save game.");
        }
    };
    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };
    return (_jsxs("div", { style: { display: "flex" }, children: [_jsx(Drawer, { variant: "persistent", anchor: "left", open: drawerOpen, onClose: handleDrawerToggle, children: _jsxs("div", { style: { width: 250 }, children: [_jsxs(Toolbar, { children: [_jsx(IconButton, { onClick: handleDrawerToggle, sx: { margin: '5px' }, children: _jsx(MenuIcon, {}) }), _jsx(Typography, { variant: "h6", children: "\u039C\u03B5\u03BD\u03BF\u03CD" })] }), _jsx(Divider, {}), _jsxs(List, { children: [_jsxs(ListItem, { component: "div", onClick: () => handleCreateCategoryClick(), sx: { cursor: 'pointer', display: 'flex', alignItems: 'center' }, children: [_jsx(ListItemIcon, { children: _jsx(CategoryIcon, {}) }), _jsx(ListItemText, { primary: "Create Category" })] }), _jsxs(ListItem, { component: "div", onClick: () => handleAnalyticsClick(), sx: { cursor: 'pointer', display: 'flex', alignItems: 'center' }, children: [_jsx(ListItemIcon, { children: _jsx(BarChartIcon, {}) }), _jsx(ListItemText, { primary: "Analytics" })] }), _jsxs(ListItem, { component: "div", onClick: () => handlePropertiesClick(), sx: { cursor: 'pointer', display: 'flex', alignItems: 'center' }, children: [_jsx(ListItemIcon, { children: _jsx(SettingsIcon, {}) }), _jsx(ListItemText, { primary: "Settings" })] })] })] }) }), _jsxs("main", { style: { flexGrow: 1, padding: "5px" }, children: [_jsx(IconButton, { sx: { margin: '5px' }, edge: "start", color: "inherit", "aria-label": "menu", onClick: handleDrawerToggle, children: _jsx(MenuIcon, {}) }), _jsx(Container, { children: gameInstances.length > 0 ? (_jsx(TableContainer, { component: Paper, style: { marginTop: "10px" }, children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { style: { fontWeight: 'bold', backgroundColor: '#f7eded' }, children: "Category" }), _jsx(TableCell, { style: { fontWeight: 'bold', backgroundColor: '#f7eded' }, children: "Name" }), _jsx(TableCell, { style: { fontWeight: 'bold', backgroundColor: '#f7eded' }, children: "Start Time" }), _jsx(TableCell, { style: { fontWeight: 'bold', backgroundColor: '#f7eded' }, children: "Elapsed Time" }), _jsx(TableCell, { style: { fontWeight: 'bold', backgroundColor: '#f7eded' }, children: "Total Cost (\u20AC)" }), _jsx(TableCell, { style: { fontWeight: 'bold', backgroundColor: '#f7eded' }, children: "Actions" })] }) }), _jsx(TableBody, { children: gameInstances.map((instance) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: instance.category_name }), _jsx(TableCell, { children: instance.instance_name }), _jsx(TableCell, { children: instance.start_time ? new Date(instance.start_time).toLocaleTimeString() : "-" }), _jsx(TableCell, { children: instance.elapsed_time ? formatTime(instance.elapsed_time) : "-" }), _jsx(TableCell, { children: instance.total_cost.toFixed(2) }), _jsx(TableCell, { children: _jsxs(Grid, { container: true, spacing: 0.5, children: [_jsx(Grid, { item: true, children: _jsx(Tooltip, { title: "Start", children: _jsx(Button, { color: "primary", onClick: () => startGame(instance.id), sx: {
                                                                            transition: 'transform 0.3s',
                                                                            '&:hover': {
                                                                                transform: 'scale(1.1)', // Slightly scales the button on hover
                                                                            },
                                                                        }, startIcon: _jsx(PlayArrowIcon, {}), disabled: Boolean(instance.start_time) }) }) }), _jsx(Grid, { item: true, children: _jsx(Tooltip, { title: "Reset", children: _jsx(Button, { color: "warning", onClick: () => resetGame(instance.id), startIcon: _jsx(RestartAltIcon, {}), sx: {
                                                                            transition: 'transform 0.3s',
                                                                            '&:hover': {
                                                                                transform: 'scale(1.1)', // Slightly scales the button on hover
                                                                            },
                                                                        }, disabled: !instance.start_time }) }) }), _jsx(Grid, { item: true, children: _jsx(Tooltip, { title: "Finish", children: _jsx(Button, { color: "success", sx: {
                                                                            transition: 'transform 0.s, background-color 0.6s, color 0.6s',
                                                                            '&:hover': {
                                                                                transform: 'scale(1.1)', // Slightly scales the button on hover
                                                                                backgroundColor: '#ffcccb', // Change to a custom color during hover
                                                                                color: '#1877F2', // Change the text/icon color
                                                                            },
                                                                        }, onClick: () => handleFinishConfirm(instance.id), startIcon: _jsx(CheckCircleIcon, {}), disabled: !instance.start_time || !Boolean(getTimerFromLocalStorage(instance.id.toString())) }) }) })] }) })] }, `instance-${instance.id}`))) })] }) })) : (_jsx(Typography, { variant: "body1", color: "textSecondary", style: { marginTop: "20px" }, children: "No game instances found." })) })] }), _jsx(Snackbar, { open: openSnackbar, autoHideDuration: 3000, onClose: handleSnackbarClose, children: _jsx(Alert, { onClose: handleSnackbarClose, severity: "info", sx: { width: "100%" }, children: message }) }), _jsxs(Dialog, { open: openDialog, onClose: handleDialogClose, children: [_jsx(DialogTitle, { children: "Enter Password" }), _jsx(DialogContent, { children: _jsx(TextField, { autoFocus: true, margin: "dense", label: "Password", type: "password", fullWidth: true, variant: "outlined", value: password, onChange: (e) => setPassword(e.target.value) }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleDialogClose, color: "primary", children: "Cancel" }), _jsx(Button, { onClick: handlePasswordSubmit, color: "primary", children: "Submit" })] })] })] }));
};
export default Home;
