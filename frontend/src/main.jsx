import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initCSRF } from './services/api';
import App from './App';
import './styles/globals.css';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

// Initialize security features before rendering
Promise.all([
  initCSRF(),
  // Add other initialization here if needed
]).then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}).catch((error) => {
  console.error('Failed to initialize app:', error);
  ReactDOM.createRoot(document.getElementById('root')).render(
    <div>Failed to initialize application</div>
  );
});
