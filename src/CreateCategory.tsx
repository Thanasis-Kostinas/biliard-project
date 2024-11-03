import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameContext } from "./GameContext";
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
  BILLIARDS: "Billiards",
  POOL: "Pool",
  SNOOKER: "Snooker",
  CUSTOM: "Custom", // New Custom option
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
      alert("Please fill in all fields with valid values.");
      return; // Don't proceed if validation fails
    }

    // If 'Custom' is selected, use the custom category input
    const selectedCategory = category === GameCategories.CUSTOM ? customCategory : category;

    if (!selectedCategory) {
      alert("Please enter a valid category.");
      return;
    }
  
    try {
      // Call the addGame function to save to the database
      await addGame(selectedCategory, instanceName, price);
      showSnackbar("Game saved successfully!"); // Show snackbar instead of alert
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
        <Typography variant="h4" gutterBottom>
          Create New Game
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
          <Box mb={3}>
            <TextField
              select
              label="Category"
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              SelectProps={{
                native: true,
              }}
            >
              {Object.entries(GameCategories).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </TextField>
          </Box>

          {/* Show custom category field if 'Custom' is selected */}
          {category === GameCategories.CUSTOM && (
            <Box mb={3}>
              <TextField
                label="Custom Category"
                fullWidth
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            </Box>
          )}

          {/* Instance Name */}
          <Box mb={3}>
            <TextField
              label="Instance Name"
              fullWidth
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              required
            />
          </Box>

          {/* Price per Hour */}
          <Box mb={3}>
            <TextField
              label="Price per Hour (€)"
              type="number"
              fullWidth
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
              required
            />
          </Box>

          {/* Button Box for Back and Submit */}
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/")}
              sx={{ flexGrow: 1, marginRight: 1 }}
            >
              Back
            </Button>
            <Button variant="contained" color="primary" type="submit" sx={{ flexGrow: 1 }}>
              Create Game
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
