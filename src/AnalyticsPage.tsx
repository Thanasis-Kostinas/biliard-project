import React, { useState } from 'react';
import { Container, Tabs, Tab, Button, Typography } from '@mui/material';
import PriceAnalytics from './PriceAnalytics';
import TrafficAnalytics from './TrafficAnalytics';
import './AnalyticsPage.css'; // Adjust the path if your CSS file is in a different folder
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the icon


// Main Analytics Page Component
const AnalyticsPage = () => {
    const [tabValue, setTabValue] = useState<number>(0); // State for tab selection

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Function to handle the back button click
    const handleBackButtonClick = () => {
        window.history.back();
    };

    return (
        <Container maxWidth="lg" className="analytics-container">
           
            <Button
    variant="contained"
    color="primary"
    style={{ margin: '20px' }}
    onClick={handleBackButtonClick}
    className="back-button"
    startIcon={<ArrowBackIcon />} // Add the icon here
>
    πισω
</Button>
            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                centered
                className="analytics-tabs"
            >
                <Tab label="Κερδη" />
                <Tab label="Κινηση" />
            </Tabs>
            <div className="analytics-content">
                {tabValue === 0 && <PriceAnalytics />}
                {tabValue === 1 && <TrafficAnalytics />}
            </div>
        </Container>
    );
};

export default AnalyticsPage;
