// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { GameProvider } from "./GameContext";
import Home from "./Home";
import CreateCategory from "./CreateCategory";
import AnalyticsPage from "./AnalyticsPage";  // Import AnalyticsPage
import EditGame from "./EditGame";  // Import EditGame
import Options from "./Options"; // Import Options
import './App.css'

const App = () => {
  return (
    <Router>
      <GameProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-category" element={<CreateCategory />} />
          <Route path="/analytics" element={<AnalyticsPage />} />  {/* Add AnalyticsPage route */}
          <Route path="/edit/:id" element={<EditGame />} />
          <Route path="/options" element={<Options />} /> {/* Add Options route */}
        </Routes>
      </GameProvider>
    </Router>
  );
};

export default App;
