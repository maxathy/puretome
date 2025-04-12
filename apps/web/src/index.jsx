import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@storynest/ui';
import './index.css';

const App = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
    <h1 className="text-4xl font-bold mb-6">Welcome to StoryNest</h1>
    <div dangerouslySetInnerHTML={{ __html: Button() }} />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);