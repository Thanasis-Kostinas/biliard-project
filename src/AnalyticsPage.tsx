import React, { useState, useEffect } from 'react';
import {
    Container, Tabs, Tab, Button, Typography
} from '@mui/material';
import PriceAnalytics from './PriceAnalytics';
import TrafficAnalytics from './TrafficAnalytics';
import './AnalyticsPage.css'; // Adjust the path if your CSS file is in a different folder

// Main Analytics Page Component
const AnalyticsPage = () => {
    const [tabValue, setTabValue] = useState<number>(0); // State for tab selection

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Function to handle the back button click
    const handleBackButtonClick = () => {
        // Logic for going back, e.g., using history from React Router
        window.history.back();
    };

    return (
        <Container>
            <Button
                variant="contained"
                color="primary"
                onClick={handleBackButtonClick}
                style={{ marginBottom: '16px' }}
            >
                Back
            </Button>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
                <Tab label="Price" />
                <Tab label="Traffic" />
            </Tabs>
            {tabValue === 0 && <PriceAnalytics />}
            {tabValue === 1 && <TrafficAnalytics />}
        </Container>
    );
};

export default AnalyticsPage;
