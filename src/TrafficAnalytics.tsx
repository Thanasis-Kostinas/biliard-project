import React, { useState, useEffect } from 'react';
import { Grid, Card, Typography, Select, MenuItem, TextField, CircularProgress } from '@mui/material';
import Chart from 'react-apexcharts';
import { invoke } from '@tauri-apps/api/tauri';
import { ApexOptions } from 'apexcharts';

interface GameData {
    instance_name: string;
    category_name: string;
    start_time: string;
    end_time: string | null;
    avg_total_cost?: number; // Added for averages
    avg_elapsed_time?: number; // Added for averages
}

const TrafficAnalytics = () => {
    const [trafficData, setTrafficData] = useState<GameData[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [categoryColors, setCategoryColors] = useState<{ [key: string]: string }>({});
    const [dateOption, setDateOption] = useState<'daily' | 'custom'>('daily');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [chartSeries, setChartSeries] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hourlyTraffic, setHourlyTraffic] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (dateOption === 'daily') {
            fetchTrafficData(new Date().toISOString().split('T')[0]);
        } else if (selectedDate) {
            fetchTrafficData(selectedDate);
        }
    }, [dateOption, selectedDate]);

    useEffect(() => {
        if (categories.length > 0) {
            fetchWeeklyData();
        }
    }, [categories]);

    useEffect(() => {
        if (trafficData.length > 0) {
            calculateHourlyTraffic();
        }
    }, [trafficData]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const fetchedCategories = await invoke<string[]>('get_distinct_categories');
            setCategories(fetchedCategories);

            const colors = fetchedCategories.reduce((acc, category) => {
                acc[category] = generateColorFromString(category);
                return acc;
            }, {} as { [key: string]: string });

            setCategoryColors(colors);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateColorFromString = (str: string): string => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        const r = (hash & 0xFF) % 256;
        const g = ((hash >> 8) & 0xFF) % 256;
        const b = ((hash >> 16) & 0xFF) % 256;
        const brightnessFactor = 1.2;
        const newR = Math.min(255, Math.floor(r * brightnessFactor));
        const newG = Math.min(255, Math.floor(g * brightnessFactor));
        const newB = Math.min(255, Math.floor(b * brightnessFactor));

        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    };

    const fetchTrafficData = async (date: string) => {
        setLoading(true);
        try {
            const fetchedData = await invoke<GameData[]>('fetch_custom_data', {
                startDate: date,
                endDate: date,
            });
            setTrafficData(fetchedData || []);
        } catch (error) {
            console.error('Error fetching traffic data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWeeklyData = async () => {
        setLoading(true);
        try {
            const fetchedData = await invoke<GameData[]>('fetch_weekly_data');
            if (fetchedData && fetchedData.length > 0) {
                generateChartSeries(fetchedData);
            } else {
                setChartSeries([]);
            }
        } catch (error) {
            console.error('Error fetching weekly data:', error);
            setChartSeries([]);
        } finally {
            setLoading(false);
        }
    };

    const generateChartSeries = (data: GameData[]) => {
        const series = categories.map((category) => ({
            name: category,
            data: Array(7).fill(0),
        }));

        data.forEach((game) => {
            const date = new Date(game.start_time);
            const day = date.getDay();
            const categoryIndex = categories.indexOf(game.category_name);
            if (categoryIndex !== -1 && day >= 0 && day < 7) {
                series[categoryIndex].data[day] += 1;
            }
        });

        setChartSeries(series
            .filter(serie => serie.data.some(value => value > 0))
            .map(serie => ({
                ...serie,
                data: serie.data.map(value => Number(value))
            }))
        );
    };

    const calculateHourlyTraffic = () => {
        const hourlyCounts: { [key: string]: number } = {};
        trafficData.forEach(game => {
            const startTime = new Date(game.start_time);
            const hour = startTime.getHours();
            hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
        });
        setHourlyTraffic(hourlyCounts);
    };

    const chartData = Object.values(trafficData.reduce((acc, game) => {
        const { category_name: category, instance_name: instance, start_time, end_time } = game;
        const startTime = new Date(start_time).getTime();
        const endTime = end_time ? new Date(end_time).getTime() : Date.now();

        if (!acc[category]) {
            acc[category] = { name: category, data: [] };
        }

        if (!isNaN(startTime) && !isNaN(endTime)) {
            acc[category].data.push({
                x: instance,
                y: [startTime, endTime],
                color: categoryColors[category] || '#CCCCCC',
            });
        }
        return acc;
    }, {} as Record<string, { name: string; data: { x: string; y: number[]; color: string }[] }>));

    const rangeBarChartOptions: ApexOptions = {
        chart: {
            type: 'rangeBar',
            height: 350,
            zoom: { enabled: false },
        },
        plotOptions: {
            bar: {
                borderRadius: 10,
                columnWidth: '30%',
                hideZeroBarsWhenGrouped: true,
                rangeBarOverlap: false,
                barHeight: '80%',
                horizontal: true,
                rangeBarGroupRows: true,
            },
        },
        tooltip: {
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
                const startTime = new Date(data.y[0]).toLocaleTimeString();
                const endTime = new Date(data.y[1]).toLocaleTimeString();
                return `
                    <div style="padding: 10px; border-radius: 5px; background-color: #ffffff;">
                        <b>Game Instance:</b> ${data.x}<br>
                        <b>Start Time:</b> ${startTime}<br>
                        <b>End Time:</b> ${endTime}<br>
                    </div>
                `;
            }
        },
        xaxis: { type: 'datetime' },
        title: { text: 'Ανάλυση Κίνησης', align: 'center', style: { fontSize: '20px' } },
        yaxis: { title: { text: 'Όνομα ' } },
    };

    const weeklyChartOptions: ApexOptions = {
        chart: { 
            type: 'bar', 
            height: 350,
            stacked: true,
            toolbar: { show: false }
        },
        plotOptions: { 
            bar: { 
                columnWidth: '55%',
                borderRadius: 4
            } 
        },
        xaxis: {
            categories: ['ΔΕΥ', 'ΤΡΙ', 'ΤΕΤ', 'ΠΕΜ', 'ΠΑΡ', 'ΣΑΒ', 'ΚΥΡ'],
            title: { text: 'Ημέρα' }
        },
        yaxis: { 
            title: { text: 'Αριθμός Παιχνιδιών' }
        },
        fill: { opacity: 1 },
        tooltip: { 
            y: { formatter: (val) => `${val} παιχνίδια` }
        },
        colors: Object.values(categoryColors),
        legend: {
            position: 'top',
            horizontalAlign: 'right'
        }
    };

    const hourlyChartOptions: ApexOptions = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                columnWidth: '80%',
                borderRadius: 4
            }
        },
        xaxis: {
            categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
            title: { text: 'Ώρα' }
        },
        yaxis: {
            title: { text: 'Αριθμός Παιχνιδιών' }
        },
        title: {
            text: 'Κίνηση',
            align: 'center'
        },
        colors: ['#2196f3'],
        tooltip: {
            y: {
                formatter: (val) => `${val} παιχνίδια`
            }
        }
    };

    const hourlyChartSeries = [{
        name: 'Παιχνίδια',
        data: Array.from({ length: 24 }, (_, i) => hourlyTraffic[i] || 0)
    }];

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Card sx={{ padding: 2, boxShadow: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Ανάλυση Κίνησης</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <Select
                                value={dateOption}
                                onChange={(e) => setDateOption(e.target.value as 'daily' | 'custom')}
                                sx={{ marginRight: 2 }}
                            >
                                <MenuItem value="daily">Σήμερα</MenuItem>
                                <MenuItem value="custom">Προσαρμογή</MenuItem>
                            </Select>
                        </Grid>
                        {dateOption === 'custom' && (
                            <Grid item>
                                <TextField
                                    label="Επιλογή Ημερονηνίας"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        )}
                    </Grid>
                    {loading ? (
                        <CircularProgress sx={{ marginTop: 2 }} />
                    ) : (
                        <Chart
                            options={rangeBarChartOptions}
                            series={chartData}
                            type="rangeBar"
                            height={350}
                        />
                    )}
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card sx={{ padding: 2, boxShadow: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Κίνηση ανά Ώρα Σήμερα</Typography>
                    {loading ? (
                        <CircularProgress sx={{ marginTop: 2 }} />
                    ) : (
                        <Chart
                            options={hourlyChartOptions}
                            series={hourlyChartSeries}
                            type="bar"
                            height={350}
                        />
                    )}
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card sx={{ padding: 2, boxShadow: 2, height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Επισκόπηση Κίνησης Εβδομάδας</Typography>
                    {loading ? (
                        <CircularProgress sx={{ marginTop: 2 }} />
                    ) : (
                        <Chart
                            options={weeklyChartOptions}
                            series={chartSeries}
                            type="bar"
                            height={350}
                        />
                    )}
                </Card>
            </Grid>
        </Grid>
    );
};

export default TrafficAnalytics;