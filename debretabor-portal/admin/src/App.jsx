import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import Profile from './pages/Profile';
import NEWS from './pages/News';
import ComplaintsModule from './components/ComplaintsModule';
import DashboardHome from './pages/DashboardHome';
import TENDERS from './pages/Tenders';
import VACANCIES from './pages/Vacancies';
import Events from './pages/Events'
import Noticeboard from './pages/Noticeboard';
import PhotoGallery from './pages/PhotoGallery';
import VideoGallery from './pages/VideoGallery';
import Places from './pages/PlacesManagement';
import Business from './pages/DoingBusiness';
import Projects from './pages/ProjectsManagement';
import Council from './pages/CouncilManagement';
import Executive from './pages/SubCitiesAndExecutive';
import AboutCity from './pages/AboutCityManagement';
import CityFacts from './pages/CityFacts';
import Subscribers from './pages/Subscribers';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route path="/admin" element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }>
          {/* Default dashboard home (Recent activities) */}
          <Route path="dashboard" element={<DashboardHome/>} />
          
          {/* Sub-routes for each module */}
          <Route path="profile" element={<Profile />} />
          <Route path="news" element={<NEWS />} />
          <Route path="complaints" element={<ComplaintsModule />} />
          <Route path="tenders" element={<TENDERS />} />
          <Route path="vacancies" element={<VACANCIES />} />
          <Route path="events" element={<Events />} />
          <Route path="noticeboard" element={<Noticeboard />} />
          <Route path="photogallery" element={<PhotoGallery />}/>
          <Route path="videogallery" element={<VideoGallery />}/>
          <Route path="places" element={<Places/>}/>
          <Route path="business" element={<Business/>}/>
          <Route path="projects" element={<Projects/>}/>
          <Route path="council" element={<Council/>}/>
          <Route path="subcities" element={<Executive key="subcities" initialTab="subcities" />} />
          <Route path="executive" element={<Executive key="executive" initialTab="executive" />} />
          <Route path="about" element={<AboutCity />} />
          <Route path="cityfacts" element={<CityFacts />} />
          <Route path="subscribers" element={<Subscribers />} />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}