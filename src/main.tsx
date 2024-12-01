import { createTheme, ThemeProvider } from "@mui/material";
import { CssBaseline } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

const lightTheme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          display: 'flex', // Use flexbox for centering content
          alignItems: 'center', // Vertically center content
          justifyContent: 'center', // Horizontally center content
          textAlign: 'center',          minWidth: '28px', // Smaller buttons for mobile
          height: '28px',
          fontSize: '0.7rem',
          '@media (max-width:600px)': {
            minWidth: '30px', // Even smaller on very small screens
            height: '30px',
            fontSize: 'rem',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '2px 6px', // Reduce padding for mobile
          fontSize: '0.75rem',
          '@media (max-width:600px)': {
            padding: '1px 4px', // Tight padding on very small screens
            fontSize: '0.7rem',
          },
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        item: {
          padding: '7px', // Compact spacing for Grid items
          '@media (max-width:600px)': {
            padding: '7px', // Reduce further for smaller screens
          },
        },
      },
    },
  },
  palette: {
    mode: "light",
    primary: {
      main: "#464646", // Customize your primary color here
    },
    secondary: {
      main: "#dc004e", // Customize your secondary color here
    },
    background: {
      default: "#f4f6f8", // Set the background color to white
      paper: "#ffffff", // Set the paper color for components like Paper
    },
    text: {
      primary: "#000000", // Set primary text color
      secondary: "#555555", // Set secondary text color
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 12, // Set a smaller base font size
  },
});


ReactDOM.render(
  <ThemeProvider theme={lightTheme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
  document.getElementById("root")
);
