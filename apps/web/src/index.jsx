import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@storynest/ui';

const App = () => (
  <div>
    <h1>Welcome to StoryNest</h1>
    <div dangerouslySetInnerHTML={{ __html: Button() }} />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
