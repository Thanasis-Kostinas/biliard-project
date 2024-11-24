import React, { useState } from 'react';
import { Container, Tabs, Tab, Button, Card, CardContent } from '@mui/material';
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
                style={{ margin: '7px' }}
                onClick={handleBackButtonClick}
                className="back-button"
                startIcon={<ArrowBackIcon />} // Add the icon here
            >
                πισω
            </Button>

    

<Card
  sx={{
    padding: 2,
    borderRadius: 2, // Rounded corners
    boxShadow: 10, // Stronger shadow for 3D effect
    background: 'linear-gradient(145deg, #ffffff, #e0e0e0)', // Light gradient background
    overflow: 'hidden', // Ensures content doesn't spill over rounded corners
  }}
>
  <CardContent sx={{ padding: 2 }}>
  <Tabs
    value={tabValue}
    onChange={handleTabChange}
    centered
    className="analytics-tabs"
    sx={{
        '& .MuiTab-root': {
            fontWeight: '600', // Slightly bold font
            color: '#555', // Neutral text color for unselected tabs
            textTransform: 'uppercase', // Uniform text style
            padding: '12px 20px', // Add padding for better spacing
            borderRadius: '8px', // Smooth rounded corners
            transition: 'all 0.3s ease',
            margin: '0 8px', // Add horizontal margin between tabs
        },
        '& .MuiTab-root.Mui-selected': {
            backgroundColor: '#f0f0f0', // Subtle background for selected tab
            color: '#281c24', // Darker text color for contrast
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)', // Soft shadow for depth
            transform: 'scale(1.1)', // Highlight selected tab with slight scaling
        },
        '& .MuiTab-root:hover': {
            backgroundColor: '#e0e0e0', // Light hover effect
            color: '#333', // Slightly darker text color
            transform: 'scale(1.05)', // Add a hover scale effect
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)', // Enhanced hover shadow
        },
        '& .MuiTabs-indicator': {
            height: '4px', // Thicker indicator bar
            backgroundColor: '#281c24', // Accent color for indicator
            borderRadius: '2px', // Rounded indicator edges
        },
    }}
>
    <Tab label="Κέρδη" disableRipple />
    <Tab label="Κίνηση" disableRipple />
</Tabs>

    <div className="analytics-content" style={{ marginTop: '16px' }}>
      {tabValue === 0 && <PriceAnalytics />}
      {tabValue === 1 && <TrafficAnalytics />}
    </div>
  </CardContent>
</Card>
        </Container>
    )
}

export default AnalyticsPage;
