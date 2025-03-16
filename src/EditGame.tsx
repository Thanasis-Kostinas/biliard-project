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
  Paper,
} from "@mui/material";
import { useGameContext } from "./GameContext";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

const EditGame = () => {
  const { id } = useParams<{ id: string }>();
  const { gameInstances, addGame } = useGameContext();
  const navigate = useNavigate();

  const [gameData, setGameData] = useState({
    category_name: "",
    instance_name: "",
    price_per_hour: 0,
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");
  const [isFormLoaded, setIsFormLoaded] = useState(false);

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
      setIsFormLoaded(true);
    }
  }, [id, gameInstances, isFormLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGameData((prevData) => ({
      ...prevData,
      [name]: name === "price_per_hour" ? parseFloat(value) : value,
    }));
  };

  const handleSave = async () => {
    try {
      await addGame(gameData.category_name, gameData.instance_name, gameData.price_per_hour);
      setMessage("Οι αλλαγές αποθηκεύτηκαν επιτυχώς!");
      setOpenSnackbar(true);
      navigate("/options"); // Navigate directly to options page
    } catch (error) {
      if (error instanceof Error) {
        setMessage("Σφάλμα: " + error.message);
        setOpenSnackbar(true);
      }
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const handleBack = () => {
    navigate("/options");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          borderRadius: "12px",
          background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 600,
            color: "#333",
            marginBottom: 3,
            textShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          Επεξεργασία Παιχνιδιού
        </Typography>

        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{ mt: 2 }}
        >
          <TextField
            label="Όνομα Κατηγορίας"
            name="category_name"
            value={gameData.category_name}
            onChange={handleChange}
            fullWidth
            disabled
            variant="outlined"
            sx={{
              "& .MuiInputBase-input.Mui-disabled": {
                backgroundColor: "#f8f8f8",
                color: "#666",
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />

          <TextField
            label="Όνομα"
            name="instance_name"
            value={gameData.instance_name}
            onChange={handleChange}
            fullWidth
            disabled
            variant="outlined"
            sx={{
              "& .MuiInputBase-input.Mui-disabled": {
                backgroundColor: "#f8f8f8",
                color: "#666",
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />

          <TextField
            label="Κόστος ανά Ώρα (€)"
            name="price_per_hour"
            value={gameData.price_per_hour || ""}
            onChange={handleChange}
            type="number"
            fullWidth
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "&:hover": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "bold",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            ΠΙΣΩ
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            startIcon={<SaveIcon />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "bold",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            Αποθήκευση
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{
            borderRadius: "8px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditGame;
