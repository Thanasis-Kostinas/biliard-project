import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Snackbar,
  Alert,
  Box,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { useGameContext } from "./GameContext";
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the icon


const EditGame = () => {
  const { id } = useParams<{ id: string }>(); // Get ID from the URL
  const { gameInstances, addGame } = useGameContext(); // Use addGame for saving a new instance
  const navigate = useNavigate();

  const [gameData, setGameData] = useState({
    category_name: "",
    instance_name: "",
    price_per_hour: 0,
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");
  const [isFormLoaded, setIsFormLoaded] = useState(false); // Track if form is initially loaded

  // Fetch the game instance based on the ID and populate the form
  useEffect(() => {
    if (!isFormLoaded && id) {
      const gameInstance = gameInstances.find((inst) => inst.id === Number(id));
      if (gameInstance) {
        setGameData({
          category_name: gameInstance.category_name,
          instance_name: gameInstance.instance_name,
          price_per_hour: gameInstance.price_per_hour,
        });
      }
      setIsFormLoaded(true); // Mark form as loaded after setting initial data
    }
  }, [id, gameInstances, isFormLoaded]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGameData((prevData) => ({
      ...prevData,
      [name]: name === "price_per_hour" ? parseFloat(value) : value,
    }));
  };

  // Handle saving new game instance
  const handleSave = async () => {
    try {
      await addGame(gameData.category_name, gameData.instance_name, gameData.price_per_hour); // Add new game instance
      setMessage("New game instance created successfully!");
      // setOpenSnackbar(true);

      // Redirect to home page after saving
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        alert("Failed to create game: " + error.message);
      }
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card
        variant="outlined"
        sx={{
          padding: 3,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
          backgroundColor: "#f9f9f9", // Light background
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            align="center"
            sx={{
              fontWeight: 600,
              color: "#333",
            }}
          >
            Επεξεργασία Παιχνιδιού
          </Typography>

          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            sx={{
              mt: 2,
            }}
          >
            {/* Category Name */}
            <TextField
              label="Όνομα Κατηγορίας"
              name="category_name"
              value={gameData.category_name}
              onChange={handleChange}
              fullWidth
              disabled
              margin="normal"
              variant="outlined"
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  backgroundColor: "#f1f1f1", // Light grey for disabled fields
                },
              }}
            />

            {/* Instance Name */}
            <TextField
              label="Όνομα"
              name="instance_name"
              value={gameData.instance_name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              disabled
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  backgroundColor: "#f1f1f1",
                },
              }}
            />

            {/* Price per Hour */}
            <TextField
              label="Κόστος ανά Ώρα (€)"
              name="price_per_hour"
              value={gameData.price_per_hour || ""}
              onChange={handleChange}
              type="number"
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
                },
              }}
            />
          </Box>
        </CardContent>

        {/* Button Box for Save and Back */}
        <CardActions sx={{ justifyContent: "space-between", mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBack}
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
            onClick={handleSave}
            sx={{
              flexGrow: 1,
              marginRight: 1,
              backgroundColor: "#1976d2", // Primary blue
              "&:hover": {
                backgroundColor: "#125ea5", // Darker blue on hover
              },
            }}
          >
            Αποθήκευση
          </Button>
        </CardActions>
      </Card>


      {/* Snackbar for success message */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success">
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditGame;
