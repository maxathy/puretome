// apps/web/src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store from './store';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Editor from './pages/Editor';
import InviteResponsePage from './pages/InviteResponsePage';
import Navbar from './components/Navbar';

import axios from 'axios';
import './index.css';
axios.defaults.baseURL =  'http://localhost:5000';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

function LayoutWithNavbar({ children }) {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  // Hide navbar on login/register
  const hideNavbar = ['/login', '/register'].includes(location.pathname);
  return (
    <>
      {!hideNavbar && user && <Navbar />}
      {children}
    </>
  );
}

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <LayoutWithNavbar>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/editor/' element={<Editor />} />
          <Route path='/editor/:memoirId' element={<Editor />} />
          <Route path='/invite/:memoirId' element={<InviteResponsePage />} />
        </Routes>
      </LayoutWithNavbar>
    </BrowserRouter>
  </Provider>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
