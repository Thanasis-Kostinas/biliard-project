import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Grid, Card, Typography, Select, MenuItem, TextField } from '@mui/material';
import Chart from 'react-apexcharts';
import { invoke } from '@tauri-apps/api/tauri';
const TrafficAnalytics = () => {
    const [trafficData, setTrafficData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryColors, setCategoryColors] = useState({});
    const [dateOption, setDateOption] = useState('daily');
    const [selectedDate, setSelectedDate] = useState('');
    const [weeklyData, setWeeklyData] = useState([]);
    const [chartSeries, setChartSeries] = useState([]);
    useEffect(() => {
        fetchCategories();
    }, []);
    useEffect(() => {
        dateOption === 'daily'
            ? fetchTrafficData(new Date().toISOString().split('T')[0])
            : selectedDate && fetchTrafficData(selectedDate);
    }, [dateOption, selectedDate]);
    useEffect(() => {
        if (categories.length > 0) {
            fetchWeeklyData();
        }
    }, [categories]);
    useEffect(() => {
        if (categories.length > 0 && weeklyData.length > 0) {
            generateChartSeries(weeklyData);
        }
    }, [categories, weeklyData]);
    const fetchCategories = async () => {
        try {
            const fetchedCategories = await invoke('get_distinct_categories');
            setCategories(fetchedCategories);
            const colors = fetchedCategories.reduce((acc, category) => {
                acc[category] = generateColorFromString(category);
                return acc;
            }, {});
            setCategoryColors(colors);
        }
        catch (error) {
            console.error('Error fetching categories:', error);
        }
    };
    const generateColorFromString = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Generate RGB values from the hash
        const r = (hash & 0xFF) % 256; // Red component
        const g = ((hash >> 8) & 0xFF) % 256; // Green component
        const b = ((hash >> 16) & 0xFF) % 256; // Blue component
        // Ensure brighter colors by increasing brightness
        const brightnessFactor = 1.2; // Increase brightness by 20%
        const newR = Math.min(255, Math.floor(r * brightnessFactor));
        const newG = Math.min(255, Math.floor(g * brightnessFactor));
        const newB = Math.min(255, Math.floor(b * brightnessFactor));
        // Convert to hex format
        const color = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
        return color;
    };
    const fetchTrafficData = async (date) => {
        try {
            const fetchedData = await invoke('fetch_custom_data', {
                startDate: date,
                endDate: date,
            });
            setTrafficData(fetchedData || []);
        }
        catch (error) {
            console.error('Error fetching traffic data:', error);
        }
    };
    const fetchWeeklyData = async () => {
        try {
            const fetchedData = await invoke('fetch_weekly_data');
            // Check for null values in the data and print them
            if (fetchedData) {
                fetchedData.forEach((game, index) => {
                    for (const key in game) {
                        // Type assertion to ensure key is a valid key of GameData
                        if (game[key] === null) {
                            console.log(`Null value found in game at index ${index}:`, game);
                        }
                    }
                });
            }
            setWeeklyData(fetchedData || []);
        }
        catch (error) {
            console.error('Error fetching weekly traffic data:', error);
        }
    };
    const generateChartSeries = (data) => {
        const series = categories.map((category) => ({
            name: category,
            data: Array(7).fill(0),
        }));
        data.forEach((game) => {
            const day = new Date(game.start_time).getDay();
            const categoryIndex = categories.indexOf(game.category_name);
            const adjustedDay = day === 0 ? 6 : day - 1; // Adjust Sunday to index 6
            if (categoryIndex !== -1) {
                series[categoryIndex].data[adjustedDay] += 1;
            }
        });
        setChartSeries(series.filter(serie => serie.data.some(value => value > 0))); // Filter out empty series
    };
    const chartData = Object.values(trafficData.reduce((acc, game) => {
        const { category_name: category, instance_name: instance, start_time, end_time } = game;
        // Validate and convert start_time and end_time
        const startTime = new Date(start_time).getTime();
        const endTime = end_time ? new Date(end_time).getTime() : Date.now();
        // Check if the category exists in the accumulator
        if (!acc[category]) {
            acc[category] = { name: category, data: [] };
        }
        // Ensure startTime and endTime are valid
        if (!isNaN(startTime) && !isNaN(endTime)) {
            acc[category].data.push({
                x: instance,
                y: [startTime, endTime], // Ensure y is always an array
                color: categoryColors[category] || '#CCCCCC', // Default color if category not found
            });
        }
        else {
            console.warn(`Invalid time for instance: ${instance}`, { startTime, endTime });
        }
        return acc;
    }, {}));
    const rangeBarChartOptions = {
        chart: {
            type: 'rangeBar',
            height: 350,
            zoom: {
                enabled: false, // Disable zoom
            },
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
                // Get the relevant data for the tooltip
                const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
                // Check if data exists
                if (!data) {
                    return '<div>No data available</div>';
                }
                // Extract the start and end times from the y values
                const startTime = new Date(data.y[0]).toLocaleTimeString(); // Get only the time
                const endTime = new Date(data.y[1]).toLocaleTimeString(); // Get only the time
                // Format the times
                const startFormatted = startTime.toLocaleString();
                const endFormatted = endTime.toLocaleString();
                // Build the tooltip HTML with only instance name, start time, and end time
                return ('<ul>' +
                    '<li><b>Game Instance</b>: ' + data.x + '</li>' +
                    '<li><b>Start Time</b>: ' + startFormatted + '</li>' +
                    '<li><b>End Time</b>: ' + endFormatted + '</li>' +
                    '</ul>');
            }
        },
        xaxis: { type: 'datetime' },
        title: { text: 'Traffic Analytics' },
        yaxis: { title: { text: 'Game Instances' } },
    };
    const weeklyChartOptions = {
        chart: { type: 'bar', height: 200 },
        plotOptions: { bar: { columnWidth: '55%' } },
        xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        yaxis: { title: { text: 'Total Games Played' } },
        fill: { opacity: 1 },
        tooltip: { y: { formatter: (val) => `${val} games` } },
        colors: Object.values(categoryColors),
    };
    return (_jsx(Grid, { container: true, spacing: 2, children: _jsx(Grid, { item: true, xs: 12, children: _jsxs(Card, { children: [_jsx(Typography, { variant: "h5", children: "Traffic Analytics" }), _jsxs(Select, { value: dateOption, onChange: (e) => setDateOption(e.target.value), sx: { marginRight: 2 }, children: [_jsx(MenuItem, { value: "daily", children: "Daily" }), _jsx(MenuItem, { value: "custom", children: "Custom" })] }), dateOption === 'custom' && (_jsx(TextField, { type: "date", value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), sx: { marginRight: 2 } })), _jsx(Chart, { options: rangeBarChartOptions, series: chartData, type: "rangeBar", height: 350 }), _jsx(Typography, { variant: "h5", children: "Weekly " }), _jsx(Chart, { options: weeklyChartOptions, series: chartSeries, type: "bar", height: 350 })] }) }) }));
};
export default TrafficAnalytics;
