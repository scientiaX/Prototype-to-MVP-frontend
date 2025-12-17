import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../Layout.jsx';
import Home from './pages/Home.jsx';
import Arena from './pages/Arena.jsx';
import Profile from './pages/Profile.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Calibration from './pages/Calibration.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
      <Route path="/arena" element={<Layout currentPageName="Arena"><Arena /></Layout>} />
      <Route path="/profile" element={<Layout currentPageName="Profile"><Profile /></Layout>} />
      <Route path="/leaderboard" element={<Layout currentPageName="Leaderboard"><Leaderboard /></Layout>} />
      <Route path="/calibration" element={<Layout currentPageName="Calibration"><Calibration /></Layout>} />
    </Routes>
  );
}

export default App;
