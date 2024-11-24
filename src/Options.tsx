import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useGameContext, GameInstance } from "./GameContext";
import { invoke } from "@tauri-apps/api/tauri";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the icon


const Options = () => {
  const {
    gameInstances,
    setGameInstances,
    deleteGame,
  } = useGameContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<GameInstance | null>(null);

  // Fetch games when the component mounts
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const fetchedInstances = (await invoke("get_game_instances")) as GameInstance[] || [];
        const initializedInstances = fetchedInstances.map((instance) => ({
          ...instance,
          end_time: null,
          start_time: null,
          total_cost: 0,
          elapsed_time: 0,
        }));
        setGameInstances(initializedInstances);
      } catch (error) {
        console.error("Failed to fetch game instances:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [setGameInstances]);

  // Handle delete confirmation dialog open
  const handleDeleteClick = (instance: GameInstance) => {
    setSelectedInstance(instance);
    setOpen(true);
  };

  // Confirm delete action
  const handleDeleteConfirm = () => {
    if (selectedInstance) {
      deleteGame(selectedInstance.category_name, selectedInstance.instance_name);
    }
    setOpen(false);
  };

  // Cancel delete action
  const handleDeleteCancel = () => {
    setOpen(false);
  };

  return (
    <Container>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{
          fontWeight: 'bold',
          marginTop: '15px',
          color: '#333',
          textShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
          marginBottom: '1.5rem',
        }}
      >
        Διαχείριση
      </Typography>

      {/* Back Button */}
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

      {loading ? (
        <Grid container justifyContent="center" style={{ marginTop: "20px" }}>
          <CircularProgress />
        </Grid>
      ) : (
        <>
          {gameInstances.length > 0 ? (
            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
              <Table size="small">
                <TableHead>
                  <TableRow style={{
                    background: 'linear-gradient(145deg, #2c2c2c, #464646)', // Darker blackish to lighter black gradient
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Subtle shadow for depth on the whole row
                    borderRadius: '4px', // Soft rounding for the row's corners to enhance the 3D effect
                    transition: 'all 0.3s ease', // Smooth transition for any hover effects
                  }}>
                    <TableCell style={{
                      fontWeight: 'bold',
                      color: '#FFFEFF', // Light text color
                      textAlign: 'center',
                      padding: '8px',
                      boxShadow: 'none', // Remove inner shadow for seamless look
                      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)', // Slight text shadow for contrast
                      border: 'none', // Remove borders
                    }}>
                      Κατηγορία
                    </TableCell>
                    <TableCell style={{
                      fontWeight: 'bold',
                      color: '#FFFEFF',
                      textAlign: 'center',
                      padding: '8px',
                      boxShadow: 'none', // Remove inner shadow for seamless look
                      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)', // Slight text shadow for contrast
                      border: 'none', // Remove borders
                    }}>
                      Όνομα
                    </TableCell>
                    <TableCell style={{
                      fontWeight: 'bold',
                      color: '#FFFEFF',
                      textAlign: 'center',
                      padding: '8px',
                      boxShadow: 'none', // Remove inner shadow for seamless look
                      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)', // Slight text shadow for contrast
                      border: 'none', // Remove borders
                    }}>
                      Ενέργειες
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gameInstances.map((instance) => (
                    <TableRow key={`instance-${instance.id}`} hover>
                      <TableCell>{instance.category_name}</TableCell>
                      <TableCell>{instance.instance_name}</TableCell>
                      <TableCell align="center">
                        <Grid container justifyContent="center" spacing={1}>
                          <Grid item>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => navigate(`/edit/${instance.id}`)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Grid>
                          <Grid item>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteClick(instance)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="h6" style={{ marginTop: "20px", textAlign: "center" }}>
              Μη διαθέσιμο.
            </Typography>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={open} onClose={handleDeleteCancel}>
        <DialogTitle>Επιβεβαίωση Ενέγειας</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Είσαι σίγουρος ότι θες να διαγράψεις{" "}
            {selectedInstance ? `${selectedInstance.category_name}: ${selectedInstance.instance_name}` : ''}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
        <Button
  onClick={handleDeleteCancel}
  color="primary"
  sx={{
    marginRight: 1,
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: 'rgba(0, 123, 255, 0.1)', // Subtle hover effect
    },
  }}
>
  ΠΙΣΩ
</Button>
<Button
  onClick={handleDeleteConfirm}
  color="error"
  variant="contained"
  sx={{
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 'bold',
    boxShadow: '0px 4px 6px rgba(255, 0, 0, 0.3)', // Adds a subtle shadow
    '&:hover': {
      backgroundColor: '#d32f2f', // Darker hover effect for danger
    },
  }}
>
  Διαγραφή
</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Options;
