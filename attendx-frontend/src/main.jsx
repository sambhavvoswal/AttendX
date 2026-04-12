import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#2E2E2E',
            color: '#F5F0E8',
            border: '1px solid #333333',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
