import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Container,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useGameContext, GameInstance } from "./GameContext";
import { invoke } from "@tauri-apps/api/tauri";
import './Home.css'; // Adjust the path if your CSS file is in a different folder
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BorderAll } from "@mui/icons-material";


const Home = () => {
  const {
    gameInstances,
    setGameInstances,
    startGame,
    resetGame,
    finishGame,
    deleteGame,
  } = useGameContext();
  const navigate = useNavigate();

  // State variables
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");
  const [openFinishDialog, setOpenFinishDialog] = useState(false); // State for finish confirmation dialog
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(null); // Store the selected instance ID for finishing
  const [openDialog, setOpenDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [redirectToAnalytics, setRedirectToAnalytics] = useState(false);
  const [redirectToProperties, setRedirectToProperties] = useState(false);

  const getTimerFromLocalStorage = (instanceId: string): string | null => {
    return localStorage.getItem(instanceId); // returns the timestamp string or null
  };
  // Utility function to calculate total cost
  const calculateTotalCost = (elapsedTime: number, pricePerHour: number): number => {
    return (elapsedTime / 3600000) * pricePerHour; // Convert milliseconds to hours and multiply by price per hour
  };
  // Fetch games on mount
  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Fetch game instances
        const fetchedInstances = (await invoke("get_game_instances")) as GameInstance[] || [];

        // Map over fetched instances to set end_time, total_cost, elapsed_time, and update with local storage timers
        const initializedInstances = fetchedInstances.map((instance) => {
          const storedStartTime = getTimerFromLocalStorage(instance.id.toString()); // Get the timer for this instance by ID

          if (storedStartTime) {
            const startTimeDate = new Date(storedStartTime).getTime(); // Convert to timestamp
            const startTime = storedStartTime;
            const now = Date.now(); // Current time
            const elapsedTime = now - startTimeDate; // Calculate elapsed time in milliseconds

            return {
              ...instance,
              end_time: null, // Set as needed
              start_time: startTime,
              total_cost: calculateTotalCost(elapsedTime, instance.price_per_hour), // Recalculate total cost based on elapsed time
              elapsed_time: elapsedTime, // Set elapsed time
            };
          }

          // Return instance with default values if no stored start time
          return {
            ...instance,
            end_time: null,
            start_time: null,
            total_cost: 0,
            elapsed_time: 0,
          };
        });

        // Set fetched game instances
        setGameInstances(initializedInstances);
      } catch (error) {
        console.error("Failed to fetch game instances:", error);
        showSnackbar("Error: Failed to fetch game instances.");
      }
    };

    fetchGames();
  }, [setGameInstances]);

  const showSnackbar = (msg: string) => {
    setMessage(msg);
    setOpenSnackbar(true);
  };

  // Menu handling
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Dialog handling
  const handleCreateCategoryClick = () => {
    setAnchorEl(null);
    setOpenDialog(true);
    setRedirectToAnalytics(false);
    setRedirectToProperties(false);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setPassword(""); // Clear password field
  };

  const handlePasswordSubmit = () => {
    const correctPassword = "0000"; // Replace with your actual password
    if (password === correctPassword) {
      handleDialogClose();
      if (redirectToProperties) {
        navigate("/options");
        return;
      }
      navigate(redirectToAnalytics ? "/analytics" : "/create-category");
    } else {
      showSnackbar("Incorrect password.");
    }
  };

  const handleAnalyticsClick = () => {
    setAnchorEl(null);
    setOpenDialog(true);
    setRedirectToAnalytics(true);
    setRedirectToProperties(false)
  };

  const handlePropertiesClick = () => {
    setAnchorEl(null);
    setOpenDialog(true);
    setRedirectToProperties(true);
  };

  const formatTime = (elapsed: number) => {
    const hours = Math.floor(elapsed / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, "0");
    const seconds = (elapsed % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  // Handle Finish dialog open
  const handleFinishDialogOpen = (instanceId: number) => {
    setSelectedInstanceId(instanceId);
    setOpenFinishDialog(true);
  };

  // Handle Finish dialog close
  const handleFinishDialogClose = () => {
    setOpenFinishDialog(false);
    setSelectedInstanceId(null);
  };

  // Confirm finish game instance
  const handleFinishConfirm = async () => {
    if (selectedInstanceId === null) return;

    const instance = gameInstances.find((inst) => inst.id === selectedInstanceId);
    if (!instance) {
      showSnackbar("Error: Could not find the game instance.");
      handleFinishDialogClose();
      return;
    }

    // Validate required fields before saving
    if (
      !instance.category_name ||
      !instance.instance_name ||
      instance.price_per_hour <= 0 ||
      (instance.elapsed_time !== null && instance.elapsed_time < 0) || // Check for null first
      instance.total_cost < 0 ||
      !instance.start_time
    ) {
      showSnackbar("Nothing to save: Missing required fields.");
      handleFinishDialogClose();
      return;
    }

    try {
      await finishGame(selectedInstanceId); // Call the finishGame function
      resetGame(selectedInstanceId); // Reset the game after finishing
      showSnackbar("Game saved successfully!");
    } catch (error) {
      console.error("Error saving game:", error);
      showSnackbar("Error: Failed to save game.");
    }

    handleFinishDialogClose(); // Close the dialog after finishing
  };

  // Snackbar handling
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <div>
      <AppBar position="static" >
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuClick}>
            <MenuIcon titleAccess="Menu" />
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleCreateCategoryClick}>Create New Category</MenuItem>
            <MenuItem onClick={handleAnalyticsClick}>Analytics</MenuItem>
            <MenuItem onClick={handlePropertiesClick}>Settings</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container>


        {gameInstances.length > 0 ? (
          <TableContainer component={Paper} style={{ marginTop: '10px'}}>
            <div style={{  backgroundColor: 'white' }}>

              <Table  size="small">
              <TableHead >
              <TableRow style={{ }}>
                    <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f7eded' }}>Κατηγορία</TableCell>
                    <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f7eded' }}>Ονομα</TableCell>
                    <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f7eded' }}>Ξεκηνσε</TableCell>
                    <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f7eded' }}>Τελειωσε</TableCell>
                    <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f7eded' }}>Συνολυκο κοστος (€)</TableCell>
                    <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f7eded' }}>Ενεργειες</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gameInstances.map((instance) => (
                    <TableRow key={`instance-${instance.id}`} hover>
                      <TableCell>{instance.category_name}</TableCell>
                      <TableCell>{instance.instance_name}</TableCell>
                      <TableCell>
                        {instance.start_time ? new Date(instance.start_time).toLocaleTimeString() : "-"}
                      </TableCell>
                      <TableCell>
                        {instance.elapsed_time ? formatTime(instance.elapsed_time) : "-"}
                      </TableCell>
                      <TableCell>{instance.total_cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Grid container spacing={0.5}>
                          <Grid item>
                            <Tooltip title="Start">
                              <IconButton color="success" onClick={() => startGame(instance.id)}>
                                <PlayArrowIcon />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip title="Reset">
                              <IconButton color="primary" onClick={() => resetGame(instance.id)}>
                                <RestartAltIcon />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip title="Finish">
                              <IconButton
                                color="primary"
                                disabled={instance.total_cost <= 0} // Disable if totalCost <= 0
                                onClick={() => handleFinishDialogOpen(instance.id)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                          {/* <Grid item>
                      <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => navigate(`/edit/${instance.id}`)} // Navigate to Edit page
                        >
                          Edit
                        </Button>
                        </Grid>
                      <Grid item>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => deleteGame(instance.category_name, instance.instance_name)}Table 
                        >
                          Delete
                        </Button>
                      </Grid> */}
                        </Grid>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TableContainer>
        ) : (
          <Typography variant="h6" style={{ marginTop: "20px" }}>
            No game instances available.
          </Typography>
        )}
      </Container>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="info" icon={<CheckCircleIcon />}>
          {message}
        </Alert>
      </Snackbar>

      {/* Finish Confirmation Dialog */}
      <Dialog open={openFinishDialog} onClose={handleFinishDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" style={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon color="success" style={{ marginRight: 8 }} />
            Confirm Finish Game
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedInstanceId !== null && (
            <div style={{ padding: '20px' }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Game Name:</strong> {gameInstances.find((inst) => inst.id === selectedInstanceId)?.instance_name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Category:</strong> {gameInstances.find((inst) => inst.id === selectedInstanceId)?.category_name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Time Played:</strong> {formatTime(gameInstances.find((inst) => inst.id === selectedInstanceId)?.elapsed_time || 0)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Total Cost (€):</strong> {gameInstances.find((inst) => inst.id === selectedInstanceId)?.total_cost.toFixed(2)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Started At:</strong> {new Date(gameInstances.find((inst) => inst.id === selectedInstanceId)?.start_time || "").toLocaleString()}
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFinishDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleFinishConfirm} color="primary" variant="contained">
            Yes, Finish Game
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Enter Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handlePasswordSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Home;
