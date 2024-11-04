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
      <Typography variant="h4" gutterBottom align="center">
        Manage Your Games
      </Typography>

      {/* Back Button */}
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate(-1)}
        style={{ marginBottom: "20px" }}
      >
        Back
      </Button>

      {loading ? (
        <Grid container justifyContent="center" style={{ marginTop: "20px" }}>
          <CircularProgress />
        </Grid>
      ) : (
        <>
          {gameInstances.length > 0 ? (
            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell style={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
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
              No game instances available.
            </Typography>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the game instance{" "}
            {selectedInstance ? `${selectedInstance.category_name}: ${selectedInstance.instance_name}` : ''}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Options;
