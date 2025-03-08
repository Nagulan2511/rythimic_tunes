import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Songs from './Components/Songs'
import Sidebar from './Components/Sidebar'
import Favorities from './Components/Favorities'
import Playlist from './Components/Playlist';


function App() {
 
  return (
   <div className="app-container">
    <BrowserRouter>
      <div className="sidebar-container">
        <Sidebar/>
      </div>
 
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/songs" replace />} />
          <Route path='/songs' element={<Songs/>} />
          <Route path='/favorities' element={<Favorities/>} />
          <Route path='/playlist' element={<Playlist/>} />
        </Routes>
      </div>
    </BrowserRouter>
   </div>
  )
}

export default App
