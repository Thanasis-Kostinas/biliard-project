import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri'; // Import Tauri's invoke function
// Create the context
const GameContext = createContext(undefined);
// Create a custom hook to use the context
export const useGameContext = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error("useGameContext must be used within a GameProvider");
    }
    return context;
};
// Create a provider component
export const GameProvider = ({ children }) => {
    const [gameInstances, setGameInstances] = useState([]);
    // Add the useEffect to dynamically update elapsed_time and total_cost
    useEffect(() => {
        const interval = setInterval(() => {
            setGameInstances((prevInstances) => prevInstances.map((instance) => {
                if (instance.start_time && !instance.end_time) {
                    const startTime = new Date(instance.start_time).getTime();
                    const currentTime = new Date().getTime();
                    const elapsed = Math.floor((currentTime - startTime) / 1000); // time in seconds
                    const cost = (elapsed / 3600) * instance.price_per_hour;
                    return { ...instance, elapsed_time: elapsed, total_cost: cost };
                }
                return instance;
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, [gameInstances]);
    const startGame = (id) => {
        setGameInstances((prevInstances) => prevInstances.map((instance) => instance.id === id && !instance.start_time // Only set start_time if not already started
            ? {
                ...instance,
                start_time: new Date().toISOString(),
                elapsed_time: 0, // Reset elapsed_time if needed
                total_cost: 0 // Reset total_cost if needed
            }
            : instance));
        localStorage.setItem(`${id}`, new Date().toISOString()); // Use instanceId as key
    };
    const deleteGame = async (category, instanceName) => {
        try {
            // Call Tauri command to delete the game from the database
            await invoke('delete_game', { categoryName: category, instanceName: instanceName });
            // Update state by removing the deleted game instances
            setGameInstances(prev => prev.filter(game => !(game.category_name === category && game.instance_name === instanceName)));
            alert("Game deleted successfully!");
        }
        catch (error) {
            console.error('Error deleting game:', error);
            alert("Failed to delete game: " + error);
        }
    };
    const resetGame = (id) => {
        setGameInstances((prevInstances) => prevInstances.map((instance) => instance.id === id
            ? {
                ...instance,
                elapsed_time: null,
                total_cost: 0,
                start_time: null,
                end_time: null,
            }
            : instance));
        localStorage.removeItem(`${id}`);
    };
    const roundUpToNearestHalf = (value) => {
        return Math.ceil(value * 2) / 2;
    };
    const finishGame = async (id) => {
        const instance = gameInstances.find((inst) => inst.id === id);
        if (!instance) {
            console.error("Error: Could not find the instance.");
            return;
        }
        const endTime = new Date().toISOString();
        const currentElapsedTime = instance.elapsed_time !== null ? instance.elapsed_time : 0; // Default to 0 if null
        let finalElapsedTime = currentElapsedTime; // Default to the existing value
        if (finalElapsedTime < 3600) { // Assuming elapsed_time is in minutes
            finalElapsedTime = instance.price_per_hour / 2; // Set to price_per_hour if less than 1 hour
        }
        else {
            finalElapsedTime = roundUpToNearestHalf(instance.total_cost);
        }
        try {
            // Save game logic
            await invoke('save_game', {
                categoryName: instance.category_name,
                instanceName: instance.instance_name,
                pricePerHour: instance.price_per_hour,
                elapsedTime: instance.elapsed_time,
                totalCost: finalElapsedTime,
                startTime: instance.start_time,
                endTime: endTime,
            });
            // Update the state to reflect the finished game
            setGameInstances((prevInstances) => prevInstances.map((gameInstance) => gameInstance.id === id
                ? { ...gameInstance, end_time: endTime } // Set the end time
                : gameInstance));
            localStorage.removeItem(`${id}`);
        }
        catch (error) {
            console.error("Failed to save game:", error);
            alert("Error: Failed to save game.");
        }
    };
    // Function to add a new game
    const addGame = async (category, instanceName, pricePerHour) => {
        const newInstance = {
            id: Date.now(), // Generate a unique ID
            category_name: category,
            instance_name: instanceName,
            price_per_hour: pricePerHour,
            elapsed_time: 0,
            total_cost: 0,
            start_time: new Date().toISOString(), // Capture the current time
            end_time: new Date().toISOString(), // Null for optional end time
        };
        try {
            debugger;
            // Invoke the Tauri command to save the game
            await invoke('save_game', {
                categoryName: newInstance.category_name,
                instanceName: newInstance.instance_name,
                pricePerHour: newInstance.price_per_hour,
                elapsedTime: newInstance.elapsed_time,
                totalCost: newInstance.total_cost,
                startTime: newInstance.start_time,
                endTime: newInstance.end_time,
            });
            alert("Game saved successfully!");
            // Update local state after saving the game to the database
            setGameInstances((prev) => [...prev, newInstance]);
        }
        catch (error) {
            console.error('Error saving game:', error);
            alert("Failed to save game: " + error);
        }
    };
    return (_jsx(GameContext.Provider, { value: { gameInstances, setGameInstances, startGame, resetGame, finishGame, addGame, deleteGame }, children: children }));
};
