import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Dashboard from './pages/Dashboard';
import axios from 'axios';
import './index.css';
axios.defaults.baseURL = 'http://localhost:5000';

if (localStorage.getItem('token')) {
  axios.interceptors.request.use(
    config => {
      config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
      return config;
    }
  );
}

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/dashboard' element={<Dashboard />} />
    </Routes>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
