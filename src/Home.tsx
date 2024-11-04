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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CategoryIcon from "@mui/icons-material/Category";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useGameContext, GameInstance } from "./GameContext";
import { invoke } from "@tauri-apps/api/tauri";
import './Home.css'; // Adjust the path if your CSS file is in a different folder

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
  const [openFinishDialog, setOpenFinishDialog] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [redirectToAnalytics, setRedirectToAnalytics] = useState(false);
  const [redirectToProperties, setRedirectToProperties] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Prevents UI from right clicked so user cant press right  click back and go back to analytics
//   useEffect(() => {
//     const handleContextmenu = (e: MouseEvent) => {
//         e.preventDefault();
//     };
//     document.addEventListener('contextmenu', handleContextmenu);
//     return function cleanup() {
//         document.removeEventListener('contextmenu', handleContextmenu);
//     };
// }, []);

  const getTimerFromLocalStorage = (instanceId: string): string | null => {
    return localStorage.getItem(instanceId);
  };

  const calculateTotalCost = (elapsedTime: number, pricePerHour: number): number => {
    return (elapsedTime / 3600000) * pricePerHour;
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const fetchedInstances = (await invoke("get_game_instances")) as GameInstance[] || [];
        const initializedInstances = fetchedInstances.map((instance) => {
          const storedStartTime = getTimerFromLocalStorage(instance.id.toString());
          if (storedStartTime) {
            const startTimeDate = new Date(storedStartTime).getTime();
            const startTime = storedStartTime;
            const now = Date.now();
            const elapsedTime = now - startTimeDate;

            return {
              ...instance,
              end_time: null,
              start_time: startTime,
              total_cost: calculateTotalCost(elapsedTime, instance.price_per_hour),
              elapsed_time: elapsedTime,
            };
          }

          return {
            ...instance,
            end_time: null,
            start_time: null,
            total_cost: 0,
            elapsed_time: 0,
          };
        });
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

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
    handleCreateCategoryClick()
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

  const handleFinishDialogOpen = (instanceId: number) => {
    setSelectedInstanceId(instanceId);
    setOpenFinishDialog(true);
  };

  const handleFinishDialogClose = () => {
    setOpenFinishDialog(false);
    setSelectedInstanceId(null);
  };

  const handleFinishConfirm = async () => {
    if (selectedInstanceId === null) return;

    const instance = gameInstances.find((inst) => inst.id === selectedInstanceId);
    if (!instance) {
      showSnackbar("Error: Could not find the game instance.");
      handleFinishDialogClose();
      return;
    }

    if (
      !instance.category_name ||
      !instance.instance_name ||
      instance.price_per_hour <= 0 ||
      (instance.elapsed_time !== null && instance.elapsed_time < 0) ||
      instance.total_cost < 0 ||
      !instance.start_time
    ) {
      showSnackbar("Nothing to save: Missing required fields.");
      handleFinishDialogClose();
      return;
    }

    try {
      await finishGame(selectedInstanceId);
      // resetGame(selectedInstanceId);
      showSnackbar("Game saved successfully!");
    } catch (error) {
      console.error("Error saving game:", error);
      showSnackbar("Error: Failed to save game.");
    }

    handleFinishDialogClose();
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };


  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        <div style={{ width: 250 }}>
          <Toolbar>
          <IconButton onClick={handleDrawerToggle} sx={{ margin: '5px' }}>
  <MenuIcon />
</IconButton>
            <Typography variant="h6">Μενού</Typography>
          </Toolbar>
          <Divider />
          <List>
      <ListItem 
        component="div" 
        onClick={() => handleCreateCategoryClick()} 
        sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <ListItemIcon><CategoryIcon /></ListItemIcon>
        <ListItemText primary="Create Category" />
      </ListItem>
      <ListItem 
        component="div" 
        onClick={() => handleAnalyticsClick()} 
        sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <ListItemIcon><BarChartIcon /></ListItemIcon>
        <ListItemText primary="Analytics" />
      </ListItem>
      <ListItem 
        component="div" 
        onClick={() => handlePropertiesClick()} 
        sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <ListItemIcon><SettingsIcon /></ListItemIcon>
        <ListItemText primary="Settings" />
      </ListItem>
    </List>
        </div>
      </Drawer>

      {/* Main content */}
      <main style={{ flexGrow: 1, padding: "5px" }}>
      <IconButton sx={{ margin: '5px' }} edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>

        <Container>
          {gameInstances.length > 0 ? (
            <TableContainer component={Paper} style={{ marginTop: "10px" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f7eded' }}>Category</TableCell>
                    <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f7eded' }}>Name</TableCell>
                    <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f7eded' }}>Start Time</TableCell>
                    <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f7eded' }}>Elapsed Time</TableCell>
                    <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f7eded' }}>Total Cost (€)</TableCell>
                    <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f7eded' }}>Actions</TableCell>
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
                              <Button
                                color="primary"
                                onClick={() => startGame(instance.id)}
                                startIcon={<PlayArrowIcon />}
                                disabled={Boolean(instance.start_time)}
                              />
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip title="Reset">
                              <Button
                                color="warning"
                                onClick={() => resetGame(instance.id)}
                                startIcon={<RestartAltIcon />}
                                disabled={!instance.start_time}
                              />
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip title="Finish">
                              <Button
                                color="success"
                                onClick={() => handleFinishDialogOpen(instance.id)}
                                startIcon={<CheckCircleIcon />}
                                disabled={!instance.start_time}
                              />
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" color="textSecondary" style={{ marginTop: "20px" }}>
              No game instances found.
            </Typography>
          )}
        </Container>
      </main>

      {/* Finish dialog */}
      <Dialog open={openFinishDialog} onClose={handleFinishDialogClose}>
        <DialogTitle>Finish Game</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to finish this game? All progress will be saved.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFinishDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleFinishConfirm} color="success" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="info" sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>


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
