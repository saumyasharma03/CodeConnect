// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/LandingPage';
import Home from './components/Home';
import AuthPage from './components/AuthPage';
import MyProjects from './components/MyProjects';
import Editor from './components/Editor';
import Profile from './components/Profile';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/editor" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/my-projects" element={<MyProjects />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/editor/:projectId" element={<Editor />} />
    </Routes>
  );
}
