  // src/App.jsx
  import React from 'react';
  import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
  import Landing from './components/LandingPage';
  import Home from './components/Home';
import AuthPage from './components/AuthPage';
  export default function App() {
    return (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/editor" element={<Home />} />
          <Route path="/auth" element ={<AuthPage/>}/>
        </Routes>
    );
  }
