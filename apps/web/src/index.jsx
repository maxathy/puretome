// apps/web/src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Editor from './pages/Editor';

import axios from 'axios';
import './index.css';
axios.defaults.baseURL = 'http://localhost:5000';

if (localStorage.getItem('token')) {
  axios.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
  });
}

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

        <Route path='/editor/:memoirId' element={<Editor />} />
      </Routes>
    </BrowserRouter>
  </Provider>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
