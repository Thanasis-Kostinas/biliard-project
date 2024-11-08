import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, } from "@mui/material";
import { useGameContext } from "./GameContext";
import { invoke } from "@tauri-apps/api/tauri";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
const Options = () => {
    const { gameInstances, setGameInstances, deleteGame, } = useGameContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selectedInstance, setSelectedInstance] = useState(null);
    // Fetch games when the component mounts
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const fetchedInstances = (await invoke("get_game_instances")) || [];
                const initializedInstances = fetchedInstances.map((instance) => ({
                    ...instance,
                    end_time: null,
                    start_time: null,
                    total_cost: 0,
                    elapsed_time: 0,
                }));
                setGameInstances(initializedInstances);
            }
            catch (error) {
                console.error("Failed to fetch game instances:", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchGames();
    }, [setGameInstances]);
    // Handle delete confirmation dialog open
    const handleDeleteClick = (instance) => {
        setSelectedInstance(instance);
        setOpen(true);
    };
    // Confirm delete action
    const handleDeleteConfirm = () => {
        if (selectedInstance) {
            deleteGame(selectedInstance.category_name, selectedInstance.instance_name);
        }
        setOpen(false);
    };
    // Cancel delete action
    const handleDeleteCancel = () => {
        setOpen(false);
    };
    return (_jsxs(Container, { children: [_jsx(Typography, { variant: "h4", gutterBottom: true, align: "center", children: "Manage Your Games" }), _jsx(Button, { variant: "outlined", color: "primary", onClick: () => navigate(-1), style: { marginBottom: "20px" }, children: "Back" }), loading ? (_jsx(Grid, { container: true, justifyContent: "center", style: { marginTop: "20px" }, children: _jsx(CircularProgress, {}) })) : (_jsx(_Fragment, { children: gameInstances.length > 0 ? (_jsx(TableContainer, { component: Paper, style: { marginTop: "20px" }, children: _jsxs(Table, { size: "medium", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { style: { fontWeight: 'bold' }, children: "Category" }), _jsx(TableCell, { style: { fontWeight: 'bold' }, children: "Name" }), _jsx(TableCell, { style: { fontWeight: 'bold', textAlign: 'center' }, children: "Actions" })] }) }), _jsx(TableBody, { children: gameInstances.map((instance) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: instance.category_name }), _jsx(TableCell, { children: instance.instance_name }), _jsx(TableCell, { align: "center", children: _jsxs(Grid, { container: true, justifyContent: "center", spacing: 1, children: [_jsx(Grid, { item: true, children: _jsx(IconButton, { color: "primary", size: "small", onClick: () => navigate(`/edit/${instance.id}`), children: _jsx(EditIcon, {}) }) }), _jsx(Grid, { item: true, children: _jsx(IconButton, { color: "error", size: "small", onClick: () => handleDeleteClick(instance), children: _jsx(DeleteIcon, {}) }) })] }) })] }, `instance-${instance.id}`))) })] }) })) : (_jsx(Typography, { variant: "h6", style: { marginTop: "20px", textAlign: "center" }, children: "No game instances available." })) })), _jsxs(Dialog, { open: open, onClose: handleDeleteCancel, children: [_jsx(DialogTitle, { children: "Confirm Deletion" }), _jsx(DialogContent, { children: _jsxs(DialogContentText, { children: ["Are you sure you want to delete the game instance", " ", selectedInstance ? `${selectedInstance.category_name}: ${selectedInstance.instance_name}` : '', "?"] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleDeleteCancel, color: "primary", children: "Cancel" }), _jsx(Button, { onClick: handleDeleteConfirm, color: "error", children: "Delete" })] })] })] }));
};
export default Options;
