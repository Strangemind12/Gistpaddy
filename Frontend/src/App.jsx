// src/App.jsx
import React, { useState } from 'react';
import Splash from './components/Splash';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home/Home';

function App() {
  const [showApp, setShowApp] = useState(false);

  return (
    <>
      {!showApp && <Splash onFinish={() => setShowApp(true)} />}
      {showApp && (
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;