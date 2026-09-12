import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from "./context/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById('root')).render( 
  <React.StrictMode>
     <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || '61664057766-ral4biepjmo0e3ueqtgghv0cfvprbact.apps.googleusercontent.com'}>
      <HelmetProvider>
        <BrowserRouter> 
          <AuthProvider> 
            <App />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
     </GoogleOAuthProvider>
  </React.StrictMode>
);
