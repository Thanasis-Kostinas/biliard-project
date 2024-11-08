import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { GameProvider } from "./GameContext";
import Home from "./Home";
import CreateCategory from "./CreateCategory";
import AnalyticsPage from "./AnalyticsPage"; // Import AnalyticsPage
import EditGame from "./EditGame"; // Import EditGame
import Options from "./Options"; // Import Options
import './App.css';
const App = () => {
    return (_jsx(Router, { children: _jsx(GameProvider, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/create-category", element: _jsx(CreateCategory, {}) }), _jsx(Route, { path: "/analytics", element: _jsx(AnalyticsPage, {}) }), "  ", _jsx(Route, { path: "/edit/:id", element: _jsx(EditGame, {}) }), _jsx(Route, { path: "/options", element: _jsx(Options, {}) }), " "] }) }) }));
};
export default App;
