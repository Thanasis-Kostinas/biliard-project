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
            fontWeight: '600',
            color: '#666',
            textTransform: 'none', // Changed to none for better readability
            padding: '16px 32px', // Increased padding for better touch targets
            borderRadius: '12px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            margin: '0 12px',
            fontSize: '1.1rem',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0))',
                opacity: 0,
                transition: 'opacity 0.3s ease',
            },
        },
        '& .MuiTab-root.Mui-selected': {
            backgroundColor: '#281c24',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(40, 28, 36, 0.2)',
            transform: 'translateY(-2px)',
            '&::before': {
                opacity: 1,
            },
        },
        '& .MuiTab-root:hover': {
            backgroundColor: '#f8f8f8',
            color: '#281c24',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        '& .MuiTabs-indicator': {
            display: 'none', // Removed the indicator for a cleaner look
        },
    }}
>
    <Tab 
        label="Κέρδη" 
        disableRipple 
        sx={{
            '&.Mui-selected': {
                '&:hover': {
                    backgroundColor: '#281c24',
                    color: '#ffffff',
                }
            }
        }}
    />
    <Tab 
        label="Κίνηση" 
        disableRipple 
        sx={{
            '&.Mui-selected': {
                '&:hover': {
                    backgroundColor: '#281c24',
                    color: '#ffffff',
                }
            }
        }}
    />
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
