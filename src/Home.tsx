import BarChartIcon from "@mui/icons-material/BarChart";
import CategoryIcon from "@mui/icons-material/Category";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MenuIcon from "@mui/icons-material/Menu";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Alert,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";
import { invoke } from "@tauri-apps/api/tauri";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameInstance, useGameContext } from "./GameContext";
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

  window.addEventListener("beforeunload", () => {
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
  });

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
      showSnackbar("Λάθος κωδικός πρόσβασης");;
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

  //Enable for dialog Pop Up on save
  // const handleFinishDialogOpen = (instanceId: number) => {
  //   setSelectedInstanceId(instanceId);
  //   setOpenFinishDialog(true);
  // };
  //Enable for dialog Pop Up on save

  // const handleFinishDialogClose = () => {
  //   setOpenFinishDialog(false);
  //   setSelectedInstanceId(null);
  // };

  const handleFinishConfirm = async (selectedInstanceId: number) => {
    if (selectedInstanceId === null) return;

    const instance = gameInstances.find((inst) => inst.id === selectedInstanceId);

    if (!instance) {
      showSnackbar("Error: game instance is empty.");
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
      return;
    }

    try {
      await finishGame(selectedInstanceId);
      // resetGame(selectedInstanceId);
      showSnackbar("Αποθηκεύτηκε");
    } catch (error) {
      console.error("Error saving game:", error);
      showSnackbar("Error: Failed to save game.");
    }
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
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'transform 0.2s ease, background-color 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText primary="Δημιουργία νέας κατηγορίας" />
            </ListItem>

            <ListItem
              component="div"
              onClick={() => handleAnalyticsClick()}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'transform 0.2s ease, background-color 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Αναλυτικά" />
            </ListItem>

            <ListItem
              component="div"
              onClick={() => handlePropertiesClick()}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'transform 0.2s ease, background-color 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Ρυθμίσεις" />
            </ListItem>
          </List>
        </div>
      </Drawer>

      {/* Main content */}
      <main style={{ flexGrow: 1, padding: "5px" }}>
        <IconButton
          sx={{
            margin: '5px',
            padding: '10px',  // Adjust the padding for the button
            borderRadius: '50%',  // Make the button circular
            '&:hover': {
              transform: 'scale(1.1)',  // Slightly enlarge the button on hover
            },
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',  // Add a subtle shadow
          }}
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleDrawerToggle}
        >
          <MenuIcon />
        </IconButton>

        <Container>
          {gameInstances.length > 0 ? (
            <TableContainer component={Paper} style={{ marginTop: "10px" }}>
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
                      boxShadow: 'none', // Remove inner shadow for seamless look
                      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)', // Slight text shadow for contrast
                      border: 'none', // Remove borders
                    }}>
                      Χρόνος Εκκίνησης
                    </TableCell>
                    <TableCell style={{
                      fontWeight: 'bold',
                      color: '#FFFEFF',
                      textAlign: 'center',
                      boxShadow: 'none', // Remove inner shadow for seamless look
                      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)', // Slight text shadow for contrast
                      border: 'none', // Remove borders
                    }}>
                      Συνολικός Χρόνος
                    </TableCell>
                    <TableCell style={{
                      fontWeight: 'bold',
                      color: '#FFFEFF',
                      textAlign: 'center',
                      boxShadow: 'none', // Remove inner shadow for seamless look
                      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)', // Slight text shadow for contrast
                      border: 'none', // Remove borders
                    }}>
                      Συνολικό Κόστος (€)
                    </TableCell>
                    <TableCell style={{
                      fontWeight: 'bold',
                      color: '#FFFEFF',
                      textAlign: 'center',
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
                      <TableCell>
                        {instance.start_time
                          ? new Date(instance.start_time).toLocaleTimeString("el-GR", { hour: "2-digit", minute: "2-digit" })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {instance.elapsed_time ? formatTime(instance.elapsed_time) : "-"}
                      </TableCell>
                      <TableCell>{instance.total_cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Grid container spacing={0.5}>
                          <Grid item>
                            <Tooltip title="Εκκίνηση">
                              <Button
                                onClick={() => startGame(instance.id)}
                                sx={{
                                  transition: 'transform 0.3s',
                                  '&:hover': {
                                    transform: 'scale(1.1)', // Slightly scales the button on hover
                                  },
                                }}
                                startIcon={
                                  <PlayArrowIcon
                                    sx={{
                                      color: (theme) => (Boolean(instance.start_time) ? theme.palette.grey[500] : '#34A853'), // Green when enabled, grey when disabled
                                    }}
                                  />
                                }
                                disabled={Boolean(instance.start_time)}
                              >
                              </Button>
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip title="Επαναφορά">
                              <Button
                                color="warning"
                                onClick={() => resetGame(instance.id)}
                                startIcon={<RestartAltIcon />}
                                sx={{
                                  transition: 'transform 0.3s',
                                  '&:hover': {
                                    transform: 'scale(1.1)', // Slightly scales the button on hover
                                  },
                                }}
                                disabled={!instance.start_time}
                              />
                            </Tooltip>
                          </Grid>
                          <Grid item>
                            <Tooltip title="Λήξη">
                              <Button
                                color="info"
                                sx={{
                                  transition: 'transform 0.s, background-color 0.6s, color 0.6s',
                                  '&:hover': {
                                    transform: 'scale(1.1)', // Slightly scales the button on hover
                                    backgroundColor: '#D6EAF8', // Change to a custom color during hover
                                  },
                                }}
                                onClick={() => handleFinishConfirm(instance.id)}
                                startIcon={<CheckCircleIcon />}
                                disabled={!instance.start_time || !Boolean(getTimerFromLocalStorage(instance.id.toString()))}
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

      {/* Finish dialog
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
      </Dialog> */}

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
      <Dialog
  open={openDialog}
  onClose={handleDialogClose}
  sx={{
    '& .MuiDialog-paper': {
      borderRadius: '16px', // Rounded corners
      padding: '16px', // Add padding around the dialog
      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)', // Enhanced shadow for depth
      backgroundColor: '#f9f9f9', // Light gray background
    },
  }}
>
  <DialogTitle 
    sx={{
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: '1.5rem',
      color: '#333', // Dark gray for text
    }}
  >
    Εισαγωγή Κωδικού
  </DialogTitle>

  <DialogContent 
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px', // Spacing between elements
      padding: '16px 24px',
    }}
  >
    <TextField
      autoFocus
      margin="dense"
      label="Κωδικός"
      type="password"
      fullWidth
      variant="outlined"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px', // Round input corners
        },
        '& label.Mui-focused': {
          color: '#007bff', // Light blue focus color
        },
        '& .MuiOutlinedInput-root.Mui-focused fieldset': {
          borderColor: '#007bff', // Light blue border on focus
        },
      }}
    />
  </DialogContent>

  <DialogActions 
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 24px',
      gap: '8px', // Space between buttons
    }}
  >
    <Button
      onClick={handleDialogClose}
      sx={{
        color: '#fff',
        backgroundColor: '#888',
        borderRadius: '8px',
        padding: '8px 16px',
        textTransform: 'none',
        '&:hover': {
          backgroundColor: '#666',
        },
      }}
    >
      Ακυρο
    </Button>
    <Button
      onClick={handlePasswordSubmit}
      sx={{
        color: '#fff',
        backgroundColor: '#007bff',
        borderRadius: '8px',
        padding: '8px 16px',
        textTransform: 'none',
        '&:hover': {
          backgroundColor: '#0056b3',
        },
      }}
    >
      Υποβολή
    </Button>
  </DialogActions>
</Dialog>

    </div>
  );
};

export default Home;
