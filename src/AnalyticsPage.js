import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Container, Tabs, Tab, Button, Typography } from '@mui/material';
import PriceAnalytics from './PriceAnalytics';
import TrafficAnalytics from './TrafficAnalytics';
import './AnalyticsPage.css'; // Adjust the path if your CSS file is in a different folder
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the icon
// Main Analytics Page Component
const AnalyticsPage = () => {
    const [tabValue, setTabValue] = useState(0); // State for tab selection
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    // Function to handle the back button click
    const handleBackButtonClick = () => {
        window.history.back();
    };
    return (_jsxs(Container, { maxWidth: "lg", className: "analytics-container", children: [_jsx(Typography, { variant: "h4", align: "center", className: "analytics-title", children: "Analytics Overview" }), _jsx(Button, { variant: "contained", color: "primary", style: { margin: '20px' }, onClick: handleBackButtonClick, className: "back-button", startIcon: _jsx(ArrowBackIcon, {}), children: "Back" }), _jsxs(Tabs, { value: tabValue, onChange: handleTabChange, centered: true, className: "analytics-tabs", children: [_jsx(Tab, { label: "Price" }), _jsx(Tab, { label: "Traffic" })] }), _jsxs("div", { className: "analytics-content", children: [tabValue === 0 && _jsx(PriceAnalytics, {}), tabValue === 1 && _jsx(TrafficAnalytics, {})] })] }));
};
export default AnalyticsPage;
