import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Grid, Card, Typography, Select, MenuItem, TextField, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Box, InputLabel, FormControl } from '@mui/material';
import { invoke } from '@tauri-apps/api/tauri';
import { Line } from 'react-chartjs-2';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './PriceAnalytics.css';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
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
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                fill: true,
            },
        ],
    };
    if (loading) {
        return (_jsxs(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", children: [_jsx(CircularProgress, {}), _jsx(Typography, { variant: "h6", style: { marginLeft: '1rem' }, children: "Loading Analytics..." })] }));
    }
    return (_jsx(Grid, { container: true, spacing: 3, children: _jsx(Grid, { item: true, xs: 12, children: _jsxs(Card, { style: { padding: '2rem', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, children: "Price Analytics" }), _jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", children: [_jsxs(FormControl, { variant: "outlined", style: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "Category" }), _jsxs(Select, { value: category, onChange: handleCategoryChange, label: "Category", children: [_jsx(MenuItem, { value: "All", children: "All Categories" }), categories.map((cat) => (_jsx(MenuItem, { value: cat, children: cat }, cat)))] })] }), _jsxs(FormControl, { variant: "outlined", style: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "Instance" }), _jsxs(Select, { value: instance, onChange: handleInstanceChange, label: "Instance", children: [_jsx(MenuItem, { value: "All", children: "All Instances" }), instances.map((inst) => (_jsx(MenuItem, { value: inst, children: inst }, inst)))] })] }), _jsxs(FormControl, { variant: "outlined", style: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "Interval" }), _jsxs(Select, { value: interval, onChange: handleIntervalChange, label: "Interval", children: [_jsx(MenuItem, { value: "Daily", children: "Daily" }), _jsx(MenuItem, { value: "Weekly", children: "Weekly" }), _jsx(MenuItem, { value: "Monthly", children: "Monthly" }), _jsx(MenuItem, { value: "Custom", children: "Custom" })] })] })] }), interval === 'Custom' && (_jsxs(Box, { display: "flex", justifyContent: "space-between", marginBottom: "1rem", children: [_jsx(TextField, { type: "date", label: "Start Date", value: startDate, onChange: handleStartDateChange, InputLabelProps: { shrink: true } }), _jsx(TextField, { type: "date", label: "End Date", value: endDate, onChange: handleEndDateChange, InputLabelProps: { shrink: true } })] })), _jsxs(Typography, { variant: "h6", style: { marginBottom: '1rem' }, children: ["Total Earnings: \u20AC", totalEarnings.toFixed(2)] }), _jsx("div", { style: { padding: '1rem' }, children: _jsx(Line, { data: chartData }) }), _jsxs(Accordion, { children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, {}), "aria-controls": "panel1a-content", id: "panel1a-header", children: _jsx(Typography, { children: "Game Data Table" }) }), _jsx(AccordionDetails, { children: _jsx(Box, { style: { maxHeight: '400px', overflowY: 'auto' }, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "\u038C\u03BD\u03BF\u03BC\u03B1" }), _jsx(TableCell, { children: "\u039A\u03B1\u03C4\u03B7\u03B3\u03BF\u03C1\u03AF\u03B1" }), _jsx(TableCell, { children: "\u03A4\u03B9\u03BC\u03AE \u03B1\u03BD\u03B1 \u03CE\u03C1\u03B1" }), _jsx(TableCell, { children: "Elapsed Time" }), _jsx(TableCell, { children: "Total Cost" }), _jsx(TableCell, { children: "Start Time" }), _jsx(TableCell, { children: "End Time" }), _jsx(TableCell, { children: "Actions" })] }) }), _jsx(TableBody, { children: filteredData.map((item) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: item.instance_name }), _jsx(TableCell, { children: item.category_name }), _jsx(TableCell, { children: item.price_per_hour }), _jsxs(TableCell, { children: [item.elapsed_time, " \u03BB\u03B5\u03C0\u03C4\u03AC"] }), _jsxs(TableCell, { children: ["\u20AC", item.total_cost.toFixed(2)] }), _jsx(TableCell, { children: formatStartTime(item.start_time) }), _jsx(TableCell, { children: item.end_time ? formatStartTime(item.end_time) : 'Ongoing' }), _jsx(TableCell, { children: _jsx("button", { onClick: async () => {
                                                                    try {
                                                                        await invoke('delete_game_by_id', { id: item.id });
                                                                        alert('Game deleted successfully');
                                                                        setFilteredData((prevData) => prevData.filter((game) => game.id !== item.id));
                                                                    }
                                                                    catch (error) {
                                                                        console.error('Error deleting game:', error);
                                                                        alert('Failed to delete game');
                                                                    }
                                                                }, children: "Delete" }) })] }, item.id))) })] }) }) })] })] }) }) }));
    function formatStartTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // 24-hour format
        });
    }
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(); // e.g., "10/08/2024"
    }
    function formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // e.g., "14:30"
    }
    function formatWeekday(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString([], { weekday: 'long' }); // e.g., "Monday"
    }
};
export default PriceAnalytics;
