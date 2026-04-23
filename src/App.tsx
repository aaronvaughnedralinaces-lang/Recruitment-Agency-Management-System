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
import ApplyPage from "./pages/ApplyPage/ApplyPage";
import EmployerCompanyProfile from './component/EmployerCompanyProfile';
import CompaniesPage from './pages/CompaniesPage/CompaniesPage';
import MyApplications from './pages/MyApplications/MyApplications';
import Interview from './pages/Interview/Interview';
import NotificationCenter from './pages/Notifications/NotificationCenter';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import CandidateScreening from './pages/Screening/CandidateScreening';
import Reports from './pages/Reports/Reports';

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
      <Route path="/apply/:jobId" element={<ApplyPage />} />
      <Route path="/employer/company" element={<EmployerCompanyProfile />} />
      <Route path="/companies" element={<CompaniesPage />} />
      <Route
        path="/my-applications"
        element={isAuthenticated() ? <MyApplications /> : <Navigate to="/Auth" />}
      />
      <Route
        path="/interviews"
        element={isAuthenticated() ? <Interview /> : <Navigate to="/Auth" />}
      />
      <Route
        path="/notifications"
        element={isAuthenticated() ? <NotificationCenter /> : <Navigate to="/Auth" />}
      />
      <Route
        path="/analytics"
        element={isAuthenticated() ? <AnalyticsDashboard /> : <Navigate to="/Auth" />}
      />
      <Route
        path="/screening"
        element={isAuthenticated() ? <CandidateScreening /> : <Navigate to="/Auth" />}
      />
      <Route
        path="/reports"
        element={isAuthenticated() ? <Reports /> : <Navigate to="/Auth" />}
      />
    </Routes>
  );
}

export default App;