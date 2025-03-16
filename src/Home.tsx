import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/tauri";
import { GameInstance, useGameContext } from "./GameContext";
import './Home.css';

// Import Material UI components
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
  TableSortLabel,
  TextField,
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";

// Import Material UI icons
import MenuIcon from "@mui/icons-material/Menu";
import BarChartIcon from "@mui/icons-material/BarChart";
import CategoryIcon from "@mui/icons-material/Category";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SettingsIcon from "@mui/icons-material/Settings";

// Define type for sort direction
type Order = 'asc' | 'desc';

// Define type for sortable columns
type SortableColumn = 'category_name' | 'instance_name' | 'start_time' | 'elapsed_time' | 'total_cost';

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
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [customSortOrder, setCustomSortOrder] = useState<Record<string, number>>({});
  const [openCustomSortPopup, setOpenCustomSortPopup] = useState(false);
  const categories: string[] = [...new Set(gameInstances.map((instance) => instance.category_name))];


  // Sorting state
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<SortableColumn>('category_name');
  const [sortedInstances, setSortedInstances] = useState<GameInstance[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

  useEffect(() => {
    const sortedData = [...gameInstances].sort((a, b) => {
      // Custom sort logic
      const orderA = customSortOrder[a.category_name] || Infinity;
      const orderB = customSortOrder[b.category_name] || Infinity;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // Default sorting for items within the same category
      let comparison = 0;
      switch (orderBy) {
        case 'category_name':
          comparison = (a.category_name || '').localeCompare(b.category_name || '');
          break;
        case 'instance_name':
          comparison = (a.instance_name || '').localeCompare(b.instance_name || '');
          break;
        case 'start_time':
          if (!a.start_time && !b.start_time) comparison = 0;
          else if (!a.start_time) comparison = -1;
          else if (!b.start_time) comparison = 1;
          else comparison = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
          break;
        case 'elapsed_time':
          if (a.elapsed_time === null && b.elapsed_time === null) comparison = 0;
          else if (a.elapsed_time === null) comparison = -1;
          else if (b.elapsed_time === null) comparison = 1;
          else comparison = a.elapsed_time - b.elapsed_time;
          break;
        case 'total_cost':
          comparison = a.total_cost - b.total_cost;
          break;
        default:
          comparison = 0;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    setSortedInstances(sortedData);
  }, [gameInstances, order, orderBy, customSortOrder]);

  const groupedData = sortedInstances.reduce((acc, instance) => {
    const category = instance.category_name || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(instance);
    return acc;
  }, {} as Record<string, GameInstance[]>);



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

  const applyCustomSort = () => {
    const sortedData = [...gameInstances].sort((a, b) => {
      // Custom sort logic
      const orderA = customSortOrder[a.category_name] || Infinity; // Default to Infinity for unsorted categories
      const orderB = customSortOrder[b.category_name] || Infinity;

      // Sort by custom order first
      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // Default sorting for items within the same category
      let comparison = 0;
      switch (orderBy) {
        case 'category_name':
          comparison = (a.category_name || '').localeCompare(b.category_name || '');
          break;
        case 'instance_name':
          comparison = (a.instance_name || '').localeCompare(b.instance_name || '');
          break;
        case 'start_time':
          if (!a.start_time && !b.start_time) comparison = 0;
          else if (!a.start_time) comparison = -1;
          else if (!b.start_time) comparison = 1;
          else comparison = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
          break;
        case 'elapsed_time':
          if (a.elapsed_time === null && b.elapsed_time === null) comparison = 0;
          else if (a.elapsed_time === null) comparison = -1;
          else if (b.elapsed_time === null) comparison = 1;
          else comparison = a.elapsed_time - b.elapsed_time;
          break;
        case 'total_cost':
          comparison = a.total_cost - b.total_cost;
          break;
        default:
          comparison = 0;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    setSortedInstances(sortedData);
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

  useEffect(() => {
    const savedSortOrder = localStorage.getItem('customSortOrder');
    if (savedSortOrder) {
      setCustomSortOrder(JSON.parse(savedSortOrder));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('customSortOrder', JSON.stringify(customSortOrder));
  }, [customSortOrder]);

  // Update sorted instances whenever gameInstances or sorting changes
  useEffect(() => {
    const sortedData = [...gameInstances].sort((a, b) => {
      let comparison = 0;

      switch (orderBy) {
        case 'category_name':
          comparison = (a.category_name || '').localeCompare(b.category_name || '');
          break;
        case 'instance_name':
          comparison = (a.instance_name || '').localeCompare(b.instance_name || '');
          break;
        case 'start_time':
          // Handle null values for start_time
          if (!a.start_time && !b.start_time) comparison = 0;
          else if (!a.start_time) comparison = -1;
          else if (!b.start_time) comparison = 1;
          else comparison = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
          break;
        case 'elapsed_time':
          // Handle null values for elapsed_time
          if (a.elapsed_time === null && b.elapsed_time === null) comparison = 0;
          else if (a.elapsed_time === null) comparison = -1;
          else if (b.elapsed_time === null) comparison = 1;
          else comparison = a.elapsed_time - b.elapsed_time;
          break;
        case 'total_cost':
          comparison = a.total_cost - b.total_cost;
          break;
        default:
          comparison = 0;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    setSortedInstances(sortedData);
  }, [gameInstances, order, orderBy]);

  const handleRequestSort = (property: SortableColumn) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

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
    handleCreateCategoryClick();
  };

  // Menu handling
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Dialog handling
  const handleLogin = () => {
    const correctPassword = "0000"; // Replace with your actual password
    if (password === correctPassword) {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      setOpenDialog(false);
      setPassword("");
      showSnackbar("Επιτυχής σύνδεση");
    } else {
      showSnackbar("Λάθος κωδικός πρόσβασης");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    setDrawerOpen(false);
    showSnackbar("Αποσύνδεση");
  };

  const handleCreateCategoryClick = () => {
    if (isLoggedIn) {
      navigate("/create-category");
    }
  };

  const handleAnalyticsClick = () => {
    if (isLoggedIn) {
      navigate("/analytics");
    }
  };

  const handlePropertiesClick = () => {
    if (isLoggedIn) {
      navigate("/options");
    }
  };

  const formatTime = (elapsed: number) => {
    const hours = Math.floor(elapsed / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, "0");
    const seconds = (elapsed % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

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
      showSnackbar("Αποθηκεύτηκε");
    } catch (error) {
      console.error("Error saving game:", error);
      showSnackbar("Error: Failed to save game.");
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  // Create sort handler for table headers
  const createSortHandler = (property: SortableColumn) => () => {
    handleRequestSort(property);
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            borderRight: 'none',
          },
        }}
      >
        <div style={{ width: 280 }}>
          <Toolbar sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
          }}>
            <Typography variant="h6" sx={{
              fontWeight: 600,
              fontSize: '1.25rem',
              color: '#333'
            }}>
              Μενού
            </Typography>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                color: '#555',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'rotate(90deg)',
                  transition: 'transform 0.3s ease'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>

          <List sx={{ padding: '8px' }}>
            <ListItem
              component="div"
              onClick={() => handleCreateCategoryClick()}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                padding: '12px 16px',
                margin: '4px 0',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.06)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: '40px', color: '#1976d2' }}>
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText
                primary="Δημιουργία νέo παιχνιδιου"
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}
              />
            </ListItem>

            <ListItem
              component="div"
              onClick={() => handleAnalyticsClick()}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                padding: '12px 16px',
                margin: '4px 0',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.06)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: '40px', color: '#1976d2' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText
                primary="Αναλυτικά"
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}
              />
            </ListItem>

            <ListItem
              component="div"
              onClick={() => handlePropertiesClick()}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                padding: '12px 16px',
                margin: '4px 0',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.06)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: '40px', color: '#1976d2' }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Τροποποίηση/Διαγραφή Παιχνιδιού"
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}
              />
            </ListItem>
          </List>
        </div>
      </Drawer>

      {/* Main content */}
      <main style={{ flexGrow: 1, padding: "12px" }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          backgroundColor: 'white',
          padding: '8px 16px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          {isLoggedIn && (
            <IconButton
              sx={{
                margin: '2px',
                padding: '8px',
                borderRadius: '50%',
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                color: '#1976d2',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                },
                transition: 'all 0.2s ease',
              }}
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          )}

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#333',
              textAlign: 'center',
              flex: 1,
              fontSize: '1.1rem',
              letterSpacing: '0.3px',
            }}
          >
            Διαχείριση Χρόνου Παιχνιδιών
          </Typography>

          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              variant="outlined"
              sx={{
                color: '#1976d2',
                borderColor: '#1976d2',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
                textTransform: 'none',
                borderRadius: '8px',
                padding: '6px 16px',
              }}
            >
              Αποσύνδεση
            </Button>
          ) : (
            <Button
              onClick={() => setOpenDialog(true)}
              variant="contained"
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                textTransform: 'none',
                borderRadius: '8px',
                padding: '6px 16px',
              }}
            >
              Σύνδεση
            </Button>
          )}
        </div>

        <Container maxWidth="xl" sx={{ mt: 1 }}>
          {gameInstances.length > 0 ? (
            <Paper
              elevation={0}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                backgroundColor: 'white',
              }}
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{
                      background: 'linear-gradient(145deg, #2c2c2c, #464646)',
                      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                    }}>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          padding: '8px 16px',
                          border: 'none',
                          width: '25%',
                          fontSize: '0.85rem',
                          letterSpacing: '0.3px',
                        }}
                      >
                        Όνομα
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          padding: '8px 16px',
                          border: 'none',
                          width: '20%',
                          fontSize: '0.85rem',
                          letterSpacing: '0.3px',
                        }}
                      >
                        Χρόνος Εκκίνησης
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          padding: '8px 16px',
                          border: 'none',
                          width: '20%',
                          fontSize: '0.85rem',
                          letterSpacing: '0.3px',
                        }}
                      >
                        Συνολικός Χρόνος
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#FFFFFF',
                          textAlign: 'left',
                          padding: '8px 16px',
                          border: 'none',
                          width: '15%',
                          fontSize: '0.85rem',
                          letterSpacing: '0.3px',
                        }}
                      >
                        Συνολικό Κόστος (€)
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#FFFFFF',
                          textAlign: 'center',
                          padding: '8px 16px',
                          border: 'none',
                          width: '20%',
                          fontSize: '0.85rem',
                          letterSpacing: '0.3px',
                        }}
                      >
                        Ενέργειες
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(
                      sortedInstances.reduce((acc, instance) => {
                        const category = instance.category_name || 'Uncategorized';
                        if (!acc[category]) {
                          acc[category] = [];
                        }
                        acc[category].push(instance);
                        return acc;
                      }, {} as Record<string, GameInstance[]>)
                    )
                      .sort(([categoryA], [categoryB]) => {
                        const orderA = customSortOrder[categoryA] || Infinity;
                        const orderB = customSortOrder[categoryB] || Infinity;
                        return orderA - orderB;
                      })
                      .map(([category, instances]) => (
                        <React.Fragment key={category}>
                          <TableRow sx={{ 
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.06)',
                            },
                          }}>
                            <TableCell colSpan={5} sx={{ 
                              fontWeight: 'bold', 
                              padding: '4px 16px',
                              fontSize: '0.8rem',
                              color: '#1976d2',
                              letterSpacing: '0.3px',
                            }}>
                              {category}
                            </TableCell>
                          </TableRow>
                          {instances.map((instance) => (
                            <TableRow
                              key={`instance-${instance.id}`}
                              hover
                              sx={{
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.02)',
                                },
                                '&:nth-of-type(odd)': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.01)',
                                },
                              }}
                            >
                              <TableCell sx={{ 
                                padding: '4px 16px', 
                                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                fontSize: '0.8rem',
                                color: '#333',
                              }}>
                                {instance.instance_name}
                              </TableCell>
                              <TableCell sx={{ 
                                padding: '4px 16px', 
                                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                fontSize: '0.8rem',
                                color: '#666',
                              }}>
                                {instance.start_time
                                  ? new Date(instance.start_time).toLocaleTimeString("el-GR", { hour: "2-digit", minute: "2-digit" })
                                  : "-"}
                              </TableCell>
                              <TableCell sx={{ 
                                padding: '4px 16px', 
                                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                fontSize: '0.8rem',
                                color: '#666',
                              }}>
                                {instance.elapsed_time ? formatTime(instance.elapsed_time) : "-"}
                              </TableCell>
                              <TableCell sx={{ 
                                padding: '4px 16px', 
                                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                fontSize: '0.8rem',
                              }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 500,
                                    color: instance.total_cost > 0 ? '#1976d2' : '#666',
                                    fontSize: '0.8rem',
                                  }}
                                >
                                  {instance.total_cost.toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{
                                padding: '4px 16px',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                textAlign: 'center',
                              }}>
                                <Grid container spacing={0.5} justifyContent="center">
                                  <Grid item>
                                    <Tooltip title="Εκκίνηση" arrow placement="top">
                                      <span>
                                        <IconButton
                                          onClick={() => startGame(instance.id)}
                                          disabled={Boolean(instance.start_time)}
                                          sx={{
                                            backgroundColor: Boolean(instance.start_time) 
                                              ? 'rgba(0, 0, 0, 0.04)' 
                                              : 'rgba(52, 168, 83, 0.1)',
                                            color: Boolean(instance.start_time) 
                                              ? 'rgba(0, 0, 0, 0.26)' 
                                              : '#34A853',
                                            '&:hover': {
                                              backgroundColor: Boolean(instance.start_time) 
                                                ? 'rgba(0, 0, 0, 0.04)' 
                                                : 'rgba(52, 168, 83, 0.2)',
                                              transform: Boolean(instance.start_time) ? 'none' : 'scale(1.1)',
                                            },
                                            transition: 'all 0.2s ease',
                                            padding: '2px',
                                          }}
                                          size="small"
                                        >
                                          <PlayArrowIcon sx={{ fontSize: '1rem' }} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </Grid>
                                  <Grid item>
                                    <Tooltip title="Επαναφορά" arrow placement="top">
                                      <span>
                                        <IconButton
                                          onClick={() => resetGame(instance.id)}
                                          disabled={!instance.start_time}
                                          sx={{
                                            backgroundColor: !instance.start_time 
                                              ? 'rgba(0, 0, 0, 0.04)' 
                                              : 'rgba(251, 188, 5, 0.1)',
                                            color: !instance.start_time 
                                              ? 'rgba(0, 0, 0, 0.26)' 
                                              : '#FBBC05',
                                            '&:hover': {
                                              backgroundColor: !instance.start_time 
                                                ? 'rgba(0, 0, 0, 0.04)' 
                                                : 'rgba(251, 188, 5, 0.2)',
                                              transform: !instance.start_time ? 'none' : 'scale(1.1)',
                                            },
                                            transition: 'all 0.2s ease',
                                            padding: '2px',
                                          }}
                                          size="small"
                                        >
                                          <RestartAltIcon sx={{ fontSize: '1rem' }} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </Grid>
                                  <Grid item>
                                    <Tooltip title="Λήξη" arrow placement="top">
                                      <span>
                                        <IconButton
                                          onClick={() => handleFinishConfirm(instance.id)}
                                          disabled={!instance.start_time || !Boolean(getTimerFromLocalStorage(instance.id.toString()))}
                                          sx={{
                                            backgroundColor: !instance.start_time || !Boolean(getTimerFromLocalStorage(instance.id.toString()))
                                              ? 'rgba(0, 0, 0, 0.04)'
                                              : 'rgba(66, 133, 244, 0.1)',
                                            color: !instance.start_time || !Boolean(getTimerFromLocalStorage(instance.id.toString()))
                                              ? 'rgba(0, 0, 0, 0.26)'
                                              : '#4285F4',
                                            '&:hover': {
                                              backgroundColor: !instance.start_time || !Boolean(getTimerFromLocalStorage(instance.id.toString()))
                                                ? 'rgba(0, 0, 0, 0.04)'
                                                : 'rgba(66, 133, 244, 0.2)',
                                              transform: !instance.start_time || !Boolean(getTimerFromLocalStorage(instance.id.toString()))
                                                ? 'none'
                                                : 'scale(1.1)',
                                            },
                                            transition: 'all 0.2s ease',
                                            padding: '2px',
                                          }}
                                          size="small"
                                        >
                                          <CheckCircleIcon sx={{ fontSize: '1rem' }} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </Grid>
                                </Grid>
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Table footer with sorting instructions */}
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: 'rgba(25, 118, 210, 0.02)',
              }}>
                <Button
                  variant="contained"
                  onClick={() => setOpenCustomSortPopup(true)}
                  startIcon={<CategoryIcon />}
                  sx={{
                    '&:hover': { backgroundColor: '#1565c0' },
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    padding: '6px 16px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
                  }}
                >
                  Ταξινόμηση
                </Button>
              </div>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                padding: '32px',
                textAlign: 'center',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                backgroundColor: 'white',
              }}
            >
              <CategoryIcon sx={{ fontSize: '3rem', color: '#1976d2', marginBottom: '16px' }} />
              <Typography variant="h6" sx={{ color: '#333', marginBottom: '8px' }}>
                Δεν βρέθηκαν παιχνίδια
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Προσθέστε νέα παιχνίδια για να ξεκινήσετε
              </Typography>
            </Paper>
          )}
        </Container>
      </main>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="info"
          sx={{
            width: "100%",
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          {message}
        </Alert>
      </Snackbar>

      {/* Password Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
            backgroundColor: '#f9f9f9',
            maxWidth: '400px',
            width: '100%'
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: '1.5rem',
            color: '#333',
            padding: '16px 24px 8px'
          }}
        >
          Σύνδεση
        </DialogTitle>

        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
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
                borderRadius: '8px',
              },
              '& label.Mui-focused': {
                color: '#1976d2',
              },
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                borderColor: '#1976d2',
              },
            }}
          />
        </DialogContent>

        <DialogActions
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 24px 16px',
            gap: '8px',
          }}
        >
          <Button
            onClick={() => setOpenDialog(false)}
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
            onClick={handleLogin}
            sx={{
              color: '#fff',
              backgroundColor: '#1976d2',
              borderRadius: '8px',
              padding: '8px 16px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            Σύνδεση
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={openCustomSortPopup}
        onClose={() => setOpenCustomSortPopup(false)}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '12px',
            padding: '16px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            backgroundColor: '#f9f9f9',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1.1rem',
            fontWeight: '600',
            textAlign: 'center',
            padding: '8px 0 16px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            color: '#333',
            margin: 0,
          }}
        >
          Ταξινόμηση Κατηγοριών
        </DialogTitle>
        <DialogContent sx={{ padding: '16px 0' }}>
          <Typography
            variant="body2"
            sx={{
              color: '#666',
              marginBottom: '12px',
              fontSize: '0.8rem',
              textAlign: 'center',
            }}
          >
            Σύρετε τις κατηγορίες για να αλλάξετε τη σειρά τους
          </Typography>
          <List sx={{ padding: 0 }}>
            {(categories as string[]).map((category: string, index: number) => (
              <ListItem
                key={category}
                sx={{
                  padding: '4px 8px',
                  margin: '2px 0',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: '32px', color: '#1976d2' }}>
                  <CategoryIcon sx={{ fontSize: '1.1rem' }} />
                </ListItemIcon>
                <ListItemText
                  primary={category}
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: '#333',
                  }}
                />
                <TextField
                  type="number"
                  value={customSortOrder[category] || index + 1}
                  onChange={(e) =>
                    setCustomSortOrder((prev) => ({
                      ...prev,
                      [category]: parseInt(e.target.value, 10),
                    }))
                  }
                  sx={{
                    width: '60px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      display: 'none',
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '4px 6px',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                    },
                  }}
                  InputProps={{
                    inputProps: {
                      min: 1,
                      style: { textAlign: 'center' },
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions
          sx={{
            padding: '12px 0 0',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            margin: 0,
            gap: '8px',
          }}
        >
          <Button
            onClick={() => setOpenCustomSortPopup(false)}
            sx={{
              textTransform: 'none',
              color: '#666',
              fontSize: '0.85rem',
              padding: '6px 16px',
              borderRadius: '6px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Ακύρωση
          </Button>
          <Button
            onClick={() => {
              applyCustomSort();
              setOpenCustomSortPopup(false);
            }}
            variant="contained"
            sx={{
              textTransform: 'none',
              backgroundColor: '#1976d2',
              color: '#fff',
              fontSize: '0.85rem',
              padding: '6px 16px',
              borderRadius: '6px',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            Εφαρμογή
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Home;