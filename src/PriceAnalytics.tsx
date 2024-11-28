import React, { useState, useEffect } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CardContent,
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
                label: 'Σύνολο Κερδών',
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
        <Grid item xs={12}>
            <Card
                sx={{
                    padding: '2rem',
                    borderRadius: '16px', // Slightly more rounded corners
                    boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.1)', // Stronger 3D shadow for more depth
                    background: 'linear-gradient(145deg, #ffffff, #f1f1f1)', // Light gradient for background

                }}
            >
                <CardContent>

                    <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="1rem">
                        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                            <InputLabel>Κατηγορία</InputLabel>
                            <Select value={category} onChange={handleCategoryChange} label="Κατηγορία">
                                <MenuItem value="All">Όλες οι κατηγορίες</MenuItem>
                                {categories.map((cat) => (
                                    <MenuItem key={cat} value={cat}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                            <InputLabel>Όνομα</InputLabel>
                            <Select value={instance} onChange={handleInstanceChange} label="Όνομα">
                                <MenuItem value="All">Επιλογή Όλων</MenuItem>
                                {instances.map((inst) => (
                                    <MenuItem key={inst} value={inst}>
                                        {inst}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                            <InputLabel>Περίοδος</InputLabel>
                            <Select value={interval} onChange={handleIntervalChange} label="Περίοδος">
                                <MenuItem value="Daily">Σήμερα</MenuItem>
                                <MenuItem value="Weekly">Ανά Βδομάδα</MenuItem>
                                <MenuItem value="Monthly">Ανά Μήνα</MenuItem>
                                <MenuItem value="Custom">Προσαρμογή</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {interval === 'Custom' && (
                        <Box
                            display="flex"
                            flexDirection={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            gap={2}
                            marginBottom="1rem"
                        >
                            <TextField
                                type="date"
                                label="Αρχική Ημερομηνία"
                                value={startDate}
                                onChange={handleStartDateChange}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                sx={{
                                    width: { xs: '100%', sm: '48%' },
                                    backgroundColor: '#fff', // Light background for text fields
                                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow
                                    borderRadius: '8px', // Rounded edges
                                }}
                            />
                            <TextField
                                type="date"
                                label="Τελική Ημερομηνία"
                                value={endDate}
                                onChange={handleEndDateChange}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                sx={{
                                    width: { xs: '100%', sm: '48%' },
                                    backgroundColor: '#fff',
                                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                                    borderRadius: '8px',
                                }}
                            />
                        </Box>
                    )}


                    <Typography
                        variant="h4"
                        sx={{
                            marginBottom: '1rem', // Space below the text
                            textAlign: 'center', // Center the text
                            fontWeight: 'bold', // Make the text bold
                            color: '#281c24', // Use a dark color for better contrast
                            backgroundColor: '#f9f9f9', // Subtle background to highlight
                            padding: '10px 20px', // Add padding around the text
                            borderRadius: '8px', // Smooth rounded corners
                            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)', // Light shadow for depth
                        }}
                    >
                        Συνολικά Κέρδη: €{totalEarnings.toFixed(2)}
                    </Typography>

                    <Box
                        sx={{
                            padding: '16px', // Add some padding around the chart
                            margin: '0 auto', // Center the box horizontally
                            borderRadius: '8px', // Rounded corners
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Light shadow for 3D effect
                            backgroundColor: '#fff', // White background for contrast
                            display: 'flex', // To maintain the flex layout if you have multiple components inside
                            justifyContent: 'center', // Centers the chart horizontally inside the box
                        }}
                    >
                        <Bar data={chartData} options={chartOptions} /> {/* Bar chart here */}
                    </Box>
                    <Table sx={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)', borderRadius: '8px' }}>
                        <TableHead>
                            <TableRow sx={{
                                backgroundColor: '#f9f9f9', // Light background for row
                                '&:hover': {
                                    backgroundColor: '#f1f1f1', // Slight darkening on hover
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Hover shadow
                                },
                                borderRadius: '8px', // Rounded corners for row
                            }}>
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold', // Bold text for header cells
                                        fontSize: '1rem', // Adjust size for clarity
                                        color: '#333', // Dark text color
                                        padding: '12px 16px', // Add padding for better readability
                                        borderBottom: '1px solid #e0e0e0', // Subtle bottom border for separation
                                    }}
                                >
                                    Κατηγορία
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        color: '#333',
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #e0e0e0',
                                    }}
                                >
                                    Όνομα
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        color: '#333',
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #e0e0e0',
                                    }}
                                >
                                    Τιμή ανά Ώρα
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        color: '#333',
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #e0e0e0',
                                    }}
                                >
                                    Χρόνος Παιχνιδιού
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        color: '#333',
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #e0e0e0',
                                    }}
                                >
                                    Κέρδος
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        color: '#333',
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #e0e0e0',
                                    }}
                                >
                                    Ενέργειες
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredData.map((game) => (
                                <TableRow key={game.id}>
                                    <TableCell>{game.category_name}</TableCell>
                                    <TableCell>{game.instance_name}</TableCell>
                                    <TableCell>€{game.price_per_hour.toFixed(2)}</TableCell>
                                    <TableCell>
                                        {game.elapsed_time
                                            ? game.elapsed_time >= 3600
                                                ? `${Math.floor(game.elapsed_time / 3600)} ώρες και ${Math.floor((game.elapsed_time % 3600) / 60)} λεπτά`
                                                : `${Math.floor(game.elapsed_time / 60)} λεπτά`
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell>€{game.total_cost.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => handleDeleteGame(game.id)}
                                            sx={{
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.05)', // Slight scale effect on hover
                                                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)', // Subtle shadow on hover
                                                },
                                            }}
                                        >
                                            διαγραφη
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
                </CardContent>
            </Card>
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
    return date.toLocaleString('el-GR', { weekday: 'long' }); // Get the weekday name
};

export default PriceAnalytics;
