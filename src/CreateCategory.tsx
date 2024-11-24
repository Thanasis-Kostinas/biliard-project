import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameContext } from "./GameContext";
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the icon

import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Snackbar, // Import Snackbar
} from "@mui/material";

// Enum for predefined categories
const GameCategories = {
  BILLIARDS: "Μπιλιάρδο ",
  POOL: "Γαλλικό Μπιλιάρδο",
  PING_PONG: "Ping Pong",
  DARTS: "Βελάκια",
  CUSTOM: "Προσαρμογή", // New Custom option
};

const CreateCategory = () => {
  const [category, setCategory] = useState(GameCategories.BILLIARDS); // Default to Billiards
  const [customCategory, setCustomCategory] = useState(""); // New state for custom category input
  const [instanceName, setInstanceName] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const { addGame } = useGameContext(); // Assume this is adjusted for adding games
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");

  const showSnackbar = (msg: string) => {
    setMessage(msg);
    setOpenSnackbar(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(pricePerHour);

    // Validate the input fields
    if (!instanceName || isNaN(price) || price <= 0) {
      alert("Παρακαλώ συμπληρώστε όλα τα πεδία με έγκυρες τιμές.");
      return; // Don't proceed if validation fails
    }

    // If 'Custom' is selected, use the custom category input
    const selectedCategory = category === GameCategories.CUSTOM ? customCategory : category;

    if (!selectedCategory) {
      alert("Παρακαλώ εισάγετε μια έγκυρη κατηγορία.");
      return;
    }

    try {
      // Call the addGame function to save to the database
      await addGame(selectedCategory, instanceName, price);
      showSnackbar("Το παιχνίδι αποθηκεύτηκε με επιτυχία!"); // Show snackbar instead of alert
    } catch (error) {
      if (error instanceof Error) {
        alert("Failed to create game: " + error.message); // Handle errors with a message
      } else {
        alert("Failed to create game: An unknown error occurred."); // Handle unknown errors
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            marginTop: '15px',
            color: '#333',
            textAlign: 'center',
            textShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
            marginBottom: '1.5rem',
          }}
        >
          Δημιουργήστε ένα νέο παιχνίδι
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
          <Box mb={3}>
            <TextField
              select
              label="Κατηγορία"
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              SelectProps={{
                native: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                  '&:hover fieldset': {
                    borderColor: '#007bff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0056b3',
                  },
                },
              }}
            >
              {Object.entries(GameCategories).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </TextField>
          </Box>

          {category === GameCategories.CUSTOM && (
            <Box mb={3}>
              <TextField
                label="Όνομα Κατηγορίας"
                fullWidth
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    '&:hover fieldset': {
                      borderColor: '#007bff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0056b3',
                    },
                  },
                }}
              />
            </Box>
          )}

          <Box mb={3}>
            <TextField
              label="Όνομα"
              fullWidth
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                  '&:hover fieldset': {
                    borderColor: '#007bff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0056b3',
                  },
                },
              }}
            />
          </Box>

          <Box mb={3}>
            <TextField
              label="Τιμή ανά Ώρα (€)"
              type="number"
              fullWidth
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                  '&:hover fieldset': {
                    borderColor: '#007bff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0056b3',
                  },
                },
              }}
            />
          </Box>


          {/* Button Box for Back and Submit */}
          <Box display="flex" justifyContent="space-between" mb={3}>

            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/")}
              className="back-button"
              sx={{
                marginRight: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px', // Space between icon and text
                padding: '8px 16px',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
              }}
              startIcon={<ArrowBackIcon />}
            >
              ΠΙΣΩ
            </Button>

            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{
                flexGrow: 1,
                backgroundColor: '#1976d2',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              ΑΠΟΘΗΚΕΥΣΕ
            </Button>

          </Box>
        </form>

        {/* Snackbar for notifications */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          message={message}
        />
      </Paper>
    </Container>
  );
};

export default CreateCategory;
