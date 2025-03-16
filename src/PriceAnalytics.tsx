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
import { Bar, Radar } from 'react-chartjs-2';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import './PriceAnalytics.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler
);

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
    const [weeklyData, setWeeklyData] = useState<GameData[]>([]);
    const [monthlyData, setMonthlyData] = useState<GameData[]>([]);

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
            let weeklyFetchedData: GameData[] = [];
            let monthlyFetchedData: GameData[] = [];

            try {
                switch (interval) {
                    case 'Daily':
                        fetchedData = (await invoke("fetch_daily_data")) as GameData[] || [];
                        weeklyFetchedData = (await invoke("fetch_weekly_data")) as GameData[] || [];
                        monthlyFetchedData = (await invoke("fetch_monthly_data")) as GameData[] || [];
                        break;
                    case 'Weekly':
                        fetchedData = (await invoke("fetch_weekly_data")) as GameData[] || [];
                        weeklyFetchedData = (await invoke("fetch_weekly_data")) as GameData[] || [];
                        monthlyFetchedData = (await invoke("fetch_monthly_data")) as GameData[] || [];
                        break;
                    case 'Monthly':
                        fetchedData = (await invoke("fetch_monthly_data")) as GameData[] || [];
                        weeklyFetchedData = (await invoke("fetch_weekly_data")) as GameData[] || [];
                        monthlyFetchedData = (await invoke("fetch_monthly_data")) as GameData[] || [];
                        break;
                    case 'Custom':
                        if (startDate && endDate) {
                            fetchedData = (await invoke("fetch_custom_data", { startDate, endDate })) as GameData[] || [];
                            weeklyFetchedData = (await invoke("fetch_weekly_data")) as GameData[] || [];
                            monthlyFetchedData = (await invoke("fetch_monthly_data")) as GameData[] || [];
                        }
                        break;
                    default:
                        break;
                }

                let data = fetchedData.filter(item => {
                    return (category === 'All' || item.category_name === category) &&
                        (instance === 'All' || item.instance_name === instance);
                });

                let weeklyData = weeklyFetchedData.filter(item => {
                    return (category === 'All' || item.category_name === category) &&
                        (instance === 'All' || item.instance_name === instance);
                });

                let monthlyData = monthlyFetchedData.filter(item => {
                    return (category === 'All' || item.category_name === category) &&
                        (instance === 'All' || item.instance_name === instance);
                });

                setFilteredData(data);
                setWeeklyData(weeklyData);
                setMonthlyData(monthlyData);
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
                type: 'linear' as const,
                beginAtZero: true,
            },
        },
    };

    // New chart data for additional analysis
    const categoryChartData = {
        labels: categories,
        datasets: [
            {
                label: 'Κέρδη ανά Κατηγορία',
                data: categories.map(cat => 
                    filteredData
                        .filter(item => item.category_name === cat)
                        .reduce((acc, item) => acc + item.total_cost, 0)
                ),
                backgroundColor: 'rgba(153,102,255,0.5)',
                borderColor: 'rgba(153,102,255,1)',
                borderWidth: 1,
            },
        ],
    };

    const gamePlayPatternsData = {
        labels: categories,
        datasets: [
            {
                label: 'Ώρες Παιχνιδιού ανά Κατηγορία',
                data: categories.map(cat => {
                    const totalSeconds = filteredData
                        .filter(item => item.category_name === cat)
                        .reduce((acc, item) => acc + (item.elapsed_time || 0), 0);
                    return Math.round(totalSeconds / 3600); // Convert seconds to hours
                }),
                backgroundColor: 'rgba(255,159,64,0.2)',
                borderColor: 'rgba(255,159,64,1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(255,159,64,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(255,159,64,1)',
            },
        ],
    };

    const gamePlayPatternsOptions = {
        responsive: true,
        scales: {
            r: {
                type: 'radialLinear' as const,
                beginAtZero: true,
                ticks: {
                    display: false
                },
                pointLabels: {
                    font: {
                        size: 12,
                        weight: 'bold' as const
                    },
                    padding: 20
                }
            }
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `${context.raw} ώρες`;
                    }
                }
            }
        }
    };

    const timeDistributionChartData = {
        labels: filteredData.map(item => item.instance_name),
        datasets: [
            {
                label: 'Ώρες Παιχνιδιού',
                data: filteredData.map(item => {
                    const hours = item.elapsed_time ? Math.round(item.elapsed_time / 3600) : 0;
                    return hours;
                }),
                backgroundColor: 'rgba(255,99,132,0.5)',
                borderColor: 'rgba(255,99,132,1)',
                borderWidth: 1,
            },
        ],
    };

    const timeDistributionOptions = {
        responsive: true,
        scales: {
            y: {
                type: 'linear' as const,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Ώρες'
                },
                ticks: {
                    stepSize: 1,
                    callback: function(this: any, tickValue: number | string) {
                        return `${tickValue} ώρες`;
                    }
                }
            },
            x: {
                type: 'category' as const,
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `${context.raw} ώρες`;
                    }
                }
            }
        }
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
                    borderRadius: '16px',
                    boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.1)',
                    background: 'linear-gradient(145deg, #ffffff, #f1f1f1)',
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

                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        gap: '2rem',
                        marginBottom: '2rem'
                    }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                padding: '1rem 2rem',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.12)',
                                }
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 'bold',
                                    color: '#281c24',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                Συνολικά Κέρδη: €{totalEarnings.toFixed(2)}
                            </Typography>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Box
                                    sx={{
                                        padding: '24px',
                                        borderRadius: '16px',
                                        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
                                        backgroundColor: '#fff',
                                        height: '300px',
                                    }}
                                >
                                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                        Κέρδη ανά Χρονική Περίοδο
                                    </Typography>
                                    <Bar data={chartData} options={chartOptions} />
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box
                                    sx={{
                                        padding: '24px',
                                        borderRadius: '16px',
                                        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
                                        backgroundColor: '#fff',
                                        height: '300px',
                                    }}
                                >
                                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                        Κέρδη ανά Κατηγορία
                                    </Typography>
                                    <Bar data={categoryChartData} options={chartOptions} />
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box
                                    sx={{
                                        padding: '24px',
                                        borderRadius: '16px',
                                        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
                                        backgroundColor: '#fff',
                                        height: '300px',
                                    }}
                                >
                                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                        Κατανομή Χρόνου Παιχνιδιού ανά Κατηγορία
                                    </Typography>
                                    <Radar data={gamePlayPatternsData} options={gamePlayPatternsOptions} />
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box
                                    sx={{
                                        padding: '24px',
                                        borderRadius: '16px',
                                        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
                                        backgroundColor: '#fff',
                                        height: '300px',
                                    }}
                                >
                                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                        Χρόνος Παιχνιδιού ανά Παιχνίδι
                                    </Typography>
                                    <Bar data={timeDistributionChartData} options={timeDistributionOptions} />
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    <Accordion 
                        sx={{ 
                            marginTop: '2rem',
                            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
                            borderRadius: '16px',
                            '&:before': {
                                display: 'none',
                            },
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                                backgroundColor: '#f9f9f9',
                                borderRadius: '16px 16px 0 0',
                                padding: '1rem 1.5rem',
                                '&:hover': {
                                    backgroundColor: '#f1f1f1',
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Λεπτομέρειες Παιχνιδιών</Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        backgroundColor: '#e0e0e0',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '12px',
                                        color: '#666'
                                    }}
                                >
                                    {filteredData.length} εγγραφές
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ padding: '1.5rem' }}>
                            <Box sx={{ 
                                overflowX: 'auto',
                                '&::-webkit-scrollbar': {
                                    height: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    backgroundColor: '#f1f1f1',
                                    borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: '#888',
                                    borderRadius: '4px',
                                    '&:hover': {
                                        backgroundColor: '#666',
                                    },
                                },
                            }}>
                                <Table 
                                    sx={{ 
                                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)', 
                                        borderRadius: '12px',
                                        minWidth: 800,
                                        '& .MuiTableCell-root': {
                                            padding: '1rem',
                                            fontSize: '0.95rem',
                                        }
                                    }}
                                >
                                    <TableHead>
                                        <TableRow sx={{
                                            backgroundColor: '#f9f9f9',
                                            '&:hover': {
                                                backgroundColor: '#f1f1f1',
                                            },
                                            '& .MuiTableCell-root': {
                                                fontWeight: 'bold',
                                                fontSize: '1rem',
                                                color: '#333',
                                                borderBottom: '2px solid #e0e0e0',
                                                whiteSpace: 'nowrap',
                                            }
                                        }}>
                                            <TableCell>Κατηγορία</TableCell>
                                            <TableCell>Όνομα</TableCell>
                                            <TableCell align="right">Τιμή ανά Ώρα</TableCell>
                                            <TableCell align="right">Χρόνος Παιχνιδιού</TableCell>
                                            <TableCell align="right">Κέρδος</TableCell>
                                            <TableCell align="center">Ενέργειες</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                    <Typography color="text.secondary">
                                                        Δεν βρέθηκαν εγγραφές
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredData.map((game) => (
                                                <TableRow 
                                                    key={game.id}
                                                    sx={{
                                                        '&:hover': {
                                                            backgroundColor: '#f9f9f9',
                                                        },
                                                        transition: 'all 0.2s ease',
                                                        '&:last-child td': {
                                                            borderBottom: 0,
                                                        },
                                                    }}
                                                >
                                                    <TableCell>{game.category_name}</TableCell>
                                                    <TableCell>{game.instance_name}</TableCell>
                                                    <TableCell align="right">€{game.price_per_hour.toFixed(2)}</TableCell>
                                                    <TableCell align="right">
                                                        {game.elapsed_time
                                                            ? game.elapsed_time >= 3600
                                                                ? `${Math.floor(game.elapsed_time / 3600)} ώρες και ${Math.floor((game.elapsed_time % 3600) / 60)} λεπτά`
                                                                : `${Math.floor(game.elapsed_time / 60)} λεπτά`
                                                            : 'N/A'}
                                                    </TableCell>
                                                    <TableCell align="right">€{game.total_cost.toFixed(2)}</TableCell>
                                                    <TableCell align="center">
                                                        <Button
                                                            variant="contained"
                                                            color="secondary"
                                                            onClick={() => handleDeleteGame(game.id)}
                                                            sx={{
                                                                transition: 'all 0.3s ease',
                                                                textTransform: 'none',
                                                                borderRadius: '8px',
                                                                padding: '0.5rem 1rem',
                                                                minWidth: '100px',
                                                                '&:hover': {
                                                                    transform: 'scale(1.05)',
                                                                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                                                                },
                                                            }}
                                                        >
                                                            διαγραφη
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

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
