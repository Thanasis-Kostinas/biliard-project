import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Grid, Card, Typography, Select, MenuItem, TextField, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Box, InputLabel, FormControl, Snackbar, Button } from '@mui/material';
import { invoke } from '@tauri-apps/api/tauri';
import { Bar } from 'react-chartjs-2'; // Import Bar instead of Line
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './PriceAnalytics.css';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const PriceAnalytics = () => {
    const [category, setCategory] = useState('All');
    const [instance, setInstance] = useState('All');
    const [interval, setInterval] = useState('Daily');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [instances, setInstances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    useEffect(() => {
        const fetchCategoriesAndInstances = async () => {
            try {
                setLoading(true);
                const fetchedCategories = await invoke('get_distinct_categories');
                const fetchedInstances = await invoke('get_distinct_instances');
                setCategories(fetchedCategories);
                setInstances(fetchedInstances);
            }
            catch (error) {
                console.error('Error fetching categories or instances:', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchCategoriesAndInstances();
    }, []);
    useEffect(() => {
        const fetchData = async () => {
            let fetchedData = [];
            try {
                switch (interval) {
                    case 'Daily':
                        fetchedData = (await invoke("fetch_daily_data")) || [];
                        break;
                    case 'Weekly':
                        fetchedData = (await invoke("fetch_weekly_data")) || [];
                        break;
                    case 'Monthly':
                        fetchedData = (await invoke("fetch_monthly_data")) || [];
                        break;
                    case 'Custom':
                        if (startDate && endDate) {
                            fetchedData = (await invoke("fetch_custom_data", { startDate, endDate })) || [];
                        }
                        break;
                    default:
                        break;
                }
                let data = fetchedData.filter(item => {
                    return (category === 'All' || item.category_name === category) &&
                        (instance === 'All' || item.instance_name === instance);
                });
                setFilteredData(data);
            }
            catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [category, instance, interval, startDate, endDate]);
    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
    };
    const handleInstanceChange = (event) => {
        setInstance(event.target.value);
    };
    const handleIntervalChange = (event) => {
        setInterval(event.target.value);
    };
    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
    };
    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
    };
    const handleDeleteGame = async (id) => {
        try {
            await invoke('delete_game_by_id', { id });
            setSnackbarMessage('Game deleted successfully');
            setSnackbarOpen(true);
            setFilteredData((prevData) => prevData.filter((game) => game.id !== id));
        }
        catch (error) {
            console.error('Error deleting game:', error);
            setSnackbarMessage('Failed to delete game');
            setSnackbarOpen(true);
        }
    };
    const totalEarnings = filteredData.reduce((acc, item) => acc + item.total_cost, 0);
    const chartData = {
        labels: filteredData.map(item => {
            return interval === 'Daily'
                ? formatTime(item.start_time)
                : interval === 'Weekly'
                    ? formatWeekday(item.start_time)
                    : formatDate(item.start_time);
        }),
        datasets: [
            {
                label: 'Total Earnings',
                data: filteredData.map(item => item.total_cost),
                backgroundColor: 'rgba(75,192,192,0.5)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1,
            },
        ],
    };
    const chartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };
    if (loading) {
        return (_jsxs(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", children: [_jsx(CircularProgress, {}), _jsx(Typography, { variant: "h6", style: { marginLeft: '1rem' }, children: "Loading Analytics..." })] }));
    }
    return (_jsx(Grid, { container: true, spacing: 3, children: _jsx(Grid, { item: true, xs: 12, children: _jsxs(Card, { style: { padding: '2rem', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, children: "Price Analytics" }), _jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", children: [_jsxs(FormControl, { variant: "outlined", style: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "Category" }), _jsxs(Select, { value: category, onChange: handleCategoryChange, label: "Category", children: [_jsx(MenuItem, { value: "All", children: "All Categories" }), categories.map((cat) => (_jsx(MenuItem, { value: cat, children: cat }, cat)))] })] }), _jsxs(FormControl, { variant: "outlined", style: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "Instance" }), _jsxs(Select, { value: instance, onChange: handleInstanceChange, label: "Instance", children: [_jsx(MenuItem, { value: "All", children: "All Instances" }), instances.map((inst) => (_jsx(MenuItem, { value: inst, children: inst }, inst)))] })] }), _jsxs(FormControl, { variant: "outlined", style: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "Interval" }), _jsxs(Select, { value: interval, onChange: handleIntervalChange, label: "Interval", children: [_jsx(MenuItem, { value: "Daily", children: "Daily" }), _jsx(MenuItem, { value: "Weekly", children: "Weekly" }), _jsx(MenuItem, { value: "Monthly", children: "Monthly" }), _jsx(MenuItem, { value: "Custom", children: "Custom" })] })] })] }), interval === 'Custom' && (_jsxs(Box, { display: "flex", justifyContent: "space-between", marginBottom: "1rem", children: [_jsx(TextField, { type: "date", label: "Start Date", value: startDate, onChange: handleStartDateChange, InputLabelProps: { shrink: true }, variant: "outlined", style: { width: '48%' } }), _jsx(TextField, { type: "date", label: "End Date", value: endDate, onChange: handleEndDateChange, InputLabelProps: { shrink: true }, variant: "outlined", style: { width: '48%' } })] })), _jsxs(Typography, { variant: "h6", style: { marginBottom: '1rem' }, children: ["Total Earnings: \u20AC", totalEarnings.toFixed(2)] }), _jsx(Bar, { data: chartData, options: chartOptions }), " ", _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "ID" }), _jsx(TableCell, { children: "Category" }), _jsx(TableCell, { children: "Instance" }), _jsx(TableCell, { children: "Price Per Hour" }), _jsx(TableCell, { children: "Elapsed Time" }), _jsx(TableCell, { children: "Total Cost" }), _jsx(TableCell, { children: "Actions" })] }) }), _jsx(TableBody, { children: filteredData.map((game) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: game.id }), _jsx(TableCell, { children: game.category_name }), _jsx(TableCell, { children: game.instance_name }), _jsxs(TableCell, { children: ["\u20AC", game.price_per_hour.toFixed(2)] }), _jsx(TableCell, { children: game.elapsed_time ? `${game.elapsed_time} hours` : 'N/A' }), _jsxs(TableCell, { children: ["\u20AC", game.total_cost.toFixed(2)] }), _jsx(TableCell, { children: _jsx(Button, { variant: "contained", color: "secondary", onClick: () => handleDeleteGame(game.id), children: "Delete" }) })] }, game.id))) })] }), _jsx(Snackbar, { open: snackbarOpen, autoHideDuration: 6000, onClose: () => setSnackbarOpen(false), message: snackbarMessage })] }) }) }));
};
const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Formats the time as HH:MM
};
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Format it as needed
};
const formatWeekday = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { weekday: 'long' }); // Get the weekday name
};
export default PriceAnalytics;
