import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Container, Tabs, Tab, Button } from '@mui/material';
import PriceAnalytics from './PriceAnalytics';
import TrafficAnalytics from './TrafficAnalytics';
import './AnalyticsPage.css'; // Adjust the path if your CSS file is in a different folder
// Main Analytics Page Component
const AnalyticsPage = () => {
    const [tabValue, setTabValue] = useState(0); // State for tab selection
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    // Function to handle the back button click
    const handleBackButtonClick = () => {
        // Logic for going back, e.g., using history from React Router
        window.history.back();
    };
    return (_jsxs(Container, { children: [_jsx(Button, { variant: "contained", color: "primary", onClick: handleBackButtonClick, style: { marginBottom: '16px' }, children: "Back" }), _jsxs(Tabs, { value: tabValue, onChange: handleTabChange, centered: true, children: [_jsx(Tab, { label: "Price" }), _jsx(Tab, { label: "Traffic" })] }), tabValue === 0 && _jsx(PriceAnalytics, {}), tabValue === 1 && _jsx(TrafficAnalytics, {})] }));
};
export default AnalyticsPage;
