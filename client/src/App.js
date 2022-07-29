import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home/Home';
import InRoom from './pages/inRoom/InRoom';
function App() {
  const [name, setName] = useState()

  return <div>
    <Router>
      <Routes>
        <Route path='/' element={<Home setName={setName} />} />
        <Route path='/room/:roomId' element={<InRoom name={name} />} />
      </Routes>
    </Router>
  </div>
}

export default App
