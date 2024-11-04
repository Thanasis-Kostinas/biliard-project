import React, { useState, useEffect } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Card,
    Typography,
    Select,
    MenuItem,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    CircularProgress,
    Box,
    InputLabel,
    FormControl,
    Snackbar,
    Button
} from '@mui/material';
import { invoke } from '@tauri-apps/api/tauri';
import { SelectChangeEvent } from "@mui/material"; 
import { Bar } from 'react-chartjs-2'; // Import Bar instead of Line
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import './PriceAnalytics.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface GameData {
    id: number;
    category_name: string;
    instance_name: string;
    price_per_hour: number;
    elapsed_time: number | null;
    total_cost: number;
    start_time: string;
    end_time: string | null;
}

const PriceAnalytics = () => {
    const [category, setCategory] = useState<string>('All');
    const [instance, setInstance] = useState<string>('All');
    const [interval, setInterval] = useState<string>('Daily');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [filteredData, setFilteredData] = useState<GameData[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [instances, setInstances] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        const fetchCategoriesAndInstances = async () => {
            try {
                setLoading(true);
                const fetchedCategories = await invoke<string[]>('get_distinct_categories');
                const fetchedInstances = await invoke<string[]>('get_distinct_instances');
                setCategories(fetchedCategories);
                setInstances(fetchedInstances);
            } catch (error) {
                console.error('Error fetching categories or instances:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoriesAndInstances();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            let fetchedData: GameData[] = [];

            try {
                switch (interval) {
                    case 'Daily':
                        fetchedData = (await invoke("fetch_daily_data")) as GameData[] || [];
                        break;
                    case 'Weekly':
                        fetchedData = (await invoke("fetch_weekly_data")) as GameData[] || [];
                        break;
                    case 'Monthly':
                        fetchedData = (await invoke("fetch_monthly_data")) as GameData[] || [];
                        break;
                    case 'Custom':
                        if (startDate && endDate) {
                            fetchedData = (await invoke("fetch_custom_data", { startDate, endDate })) as GameData[] || [];
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
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [category, instance, interval, startDate, endDate]);

    const handleCategoryChange = (event: SelectChangeEvent<string>) => {
        setCategory(event.target.value);
    };

    const handleInstanceChange = (event: SelectChangeEvent<string>) => {
        setInstance(event.target.value as string);
    };

    const handleIntervalChange = (event: SelectChangeEvent<string>) => {
        setInterval(event.target.value as string);
    };

    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(event.target.value);
    };

    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(event.target.value);
    };

    const handleDeleteGame = async (id: number) => {
        try {
            await invoke('delete_game_by_id', { id });
            setSnackbarMessage('Game deleted successfully');
            setSnackbarOpen(true);
            setFilteredData((prevData) => prevData.filter((game) => game.id !== id));
        } catch (error) {
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
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
                <Typography variant="h6" style={{ marginLeft: '1rem' }}>Loading Analytics...</Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card style={{ padding: '2rem', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
                    <Typography variant="h4" gutterBottom>Price Analytics</Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
                        <FormControl variant="outlined" style={{ minWidth: 120 }}>
                            <InputLabel>Category</InputLabel>
                            <Select value={category} onChange={handleCategoryChange} label="Category">
                                <MenuItem value="All">All Categories</MenuItem>
                                {categories.map((cat) => (
                                    <MenuItem key={cat} value={cat}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl variant="outlined" style={{ minWidth: 120 }}>
                            <InputLabel>Instance</InputLabel>
                            <Select value={instance} onChange={handleInstanceChange} label="Instance">
                                <MenuItem value="All">All Instances</MenuItem>
                                {instances.map((inst) => (
                                    <MenuItem key={inst} value={inst}>
                                        {inst}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl variant="outlined" style={{ minWidth: 120 }}>
                            <InputLabel>Interval</InputLabel>
                            <Select value={interval} onChange={handleIntervalChange} label="Interval">
                                <MenuItem value="Daily">Daily</MenuItem>
                                <MenuItem value="Weekly">Weekly</MenuItem>
                                <MenuItem value="Monthly">Monthly</MenuItem>
                                <MenuItem value="Custom">Custom</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {interval === 'Custom' && (
                        <Box display="flex" justifyContent="space-between" marginBottom="1rem">
                            <TextField
                                type="date"
                                label="Start Date"
                                value={startDate}
                                onChange={handleStartDateChange}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                style={{ width: '48%' }}
                            />
                            <TextField
                                type="date"
                                label="End Date"
                                value={endDate}
                                onChange={handleEndDateChange}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                style={{ width: '48%' }}
                            />
                        </Box>
                    )}

                    <Typography variant="h6" style={{ marginBottom: '1rem' }}>
                        Total Earnings: €{totalEarnings.toFixed(2)}
                    </Typography>

                    <Bar data={chartData} options={chartOptions} /> {/* Use Bar chart here */}

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Instance</TableCell>
                                <TableCell>Price Per Hour</TableCell>
                                <TableCell>Elapsed Time</TableCell>
                                <TableCell>Total Cost</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredData.map((game) => (
                                <TableRow key={game.id}>
                                    <TableCell>{game.id}</TableCell>
                                    <TableCell>{game.category_name}</TableCell>
                                    <TableCell>{game.instance_name}</TableCell>
                                    <TableCell>€{game.price_per_hour.toFixed(2)}</TableCell>
                                    <TableCell>{game.elapsed_time ? `${game.elapsed_time} hours` : 'N/A'}</TableCell>
                                    <TableCell>€{game.total_cost.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="secondary" onClick={() => handleDeleteGame(game.id)}>
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={6000}
                        onClose={() => setSnackbarOpen(false)}
                        message={snackbarMessage}
                    />
                </Card>
            </Grid>
        </Grid>
    );
};

const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Formats the time as HH:MM
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Format it as needed
};

const formatWeekday = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { weekday: 'long' }); // Get the weekday name
};

export default PriceAnalytics;
