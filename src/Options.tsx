import React, { useEffect } from "react";
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
  Paper,
} from "@mui/material";
import { useGameContext, GameInstance } from "./GameContext";
import { invoke } from "@tauri-apps/api/tauri";
import './Options.css'; // Adjust the path if your CSS file is in a different folder

const Options = () => {
  const {
    gameInstances,
    setGameInstances,
    deleteGame,
  } = useGameContext();
  const navigate = useNavigate();  

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
      }
    };

    fetchGames();
  }, [setGameInstances]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Manage Your Games
      </Typography>

      {/* Back Button */}
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate(-1)} // Navigate back to the previous page
        style={{ marginBottom: "20px" }}
      >
        Back
      </Button>

      {gameInstances.length > 0 ? (
        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gameInstances.map((instance) => (
                <TableRow key={`instance-${instance.id}`} hover>
                  <TableCell>{instance.category_name}</TableCell>
                  <TableCell>{instance.instance_name}</TableCell>
                  <TableCell>
                    <Grid container spacing={0.5}>
                      <Grid item>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => navigate(`/edit/${instance.id}`)}
                        >
                          Edit
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => deleteGame(instance.category_name, instance.instance_name)}
                        >
                          Delete
                        </Button>
                      </Grid>
                    </Grid>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="h6" style={{ marginTop: "20px" }}>
          No game instances available.
        </Typography>
      )}
    </Container>
  );
};

export default Options;
