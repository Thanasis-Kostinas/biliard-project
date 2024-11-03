import React, { useState, useEffect } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Grid, Card, Typography, Select, MenuItem, TextField, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Box, InputLabel, FormControl } from '@mui/material';
import { invoke } from '@tauri-apps/api/tauri';
import { SelectChangeEvent } from "@mui/material"; // Import the SelectChangeEvent type

import { Line } from 'react-chartjs-2';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import './PriceAnalytics.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

    const handleIntervalChange =  (event: SelectChangeEvent<string>) => {
        setInterval(event.target.value as string);
    };

    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(event.target.value);
    };

    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
                            />
                            <TextField
                                type="date"
                                label="End Date"
                                value={endDate}
                                onChange={handleEndDateChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    )}

                    <Typography variant="h6" style={{ marginBottom: '1rem' }}>
                        Total Earnings: €{totalEarnings.toFixed(2)}
                    </Typography>

                    <div style={{ padding: '1rem' }}>
                        <Line data={chartData} />
                    </div>

                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>Game Data Table</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
  <Box style={{ maxHeight: '400px', overflowY: 'auto' }}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Όνομα</TableCell>
          <TableCell>Κατηγορία</TableCell>
          <TableCell>Τιμή ανα ώρα</TableCell>
          <TableCell>Elapsed Time</TableCell>
          <TableCell>Total Cost</TableCell>
          <TableCell>Start Time</TableCell>
          <TableCell>End Time</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredData.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.instance_name}</TableCell>
            <TableCell>{item.category_name}</TableCell>
            <TableCell>{item.price_per_hour}</TableCell>
            <TableCell>{item.elapsed_time} λεπτά</TableCell>
            <TableCell>€{item.total_cost.toFixed(2)}</TableCell>
            <TableCell>{formatStartTime(item.start_time)}</TableCell>
            <TableCell>{item.end_time ? formatStartTime(item.end_time) : 'Ongoing'}</TableCell>
            <TableCell>
              <button
                onClick={async () => {
                  try {
                    await invoke('delete_game_by_id', { id: item.id });
                    alert('Game deleted successfully');
                    setFilteredData((prevData) =>
                      prevData.filter((game) => game.id !== item.id)
                    );
                  } catch (error) {
                    console.error('Error deleting game:', error);
                    alert('Failed to delete game');
                  }
                }}
              >
                Delete
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
</AccordionDetails>
                    </Accordion>
                </Card>
            </Grid>
        </Grid>
    );

    function formatStartTime(dateString: string): string {
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

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString(); // e.g., "10/08/2024"
    }

    function formatTime(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // e.g., "14:30"
    }

    function formatWeekday(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString([], { weekday: 'long' }); // e.g., "Monday"
    }
};

export default PriceAnalytics;
