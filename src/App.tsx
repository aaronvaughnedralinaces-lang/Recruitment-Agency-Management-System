import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Services from './pages/Services/Services';
import Values from './pages/Values/Values';
import Contact from './pages/Contact/Contact';
import Auth from './pages/Auth/Auth';
import Dashboard from './pages/UserPages/Dashboard';
import Employer from './pages/Employer/Employer';
import Profile from "./pages/Profile/Profile";
import AdminPage from "./pages/AdminPage/AdminPage";

function App() {
  // Helper function to check authentication
  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Services" element={<Services />} />
      <Route path="/Values" element={<Values />} />
      <Route path="/Contact" element={<Contact />} />
      <Route path="/Auth" element={<Auth />} />
      <Route
        path="/Dashboard"
        element={isAuthenticated() ? <Dashboard /> : <Navigate to="/Auth" />}
      />
      <Route
        path="/profile"
        element={isAuthenticated() ? <Profile /> : <Navigate to="/Auth" />}
      />
      <Route
        path="/Employer"
        element={isAuthenticated() ? <Employer /> : <Navigate to="/Auth" />}
      />
      <Route
        path="/AdminPage"
        element={isAuthenticated() ? <AdminPage /> : <Navigate to="/Auth" />}
      />
    </Routes>
  );
}

export default App;