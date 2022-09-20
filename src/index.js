import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { YoroiProvider } from './hooks/yoroiProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <YoroiProvider>
      <App />
    </YoroiProvider>
  </React.StrictMode>
);
