import { createTheme, ThemeProvider } from "@mui/material";
import { CssBaseline } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // Customize your primary color here
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
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // Use a common font
  },
});

ReactDOM.render(
  <ThemeProvider theme={lightTheme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
  document.getElementById("root")
);
