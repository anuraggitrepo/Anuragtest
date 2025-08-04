import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

import Navbar from './components/Navbar';
import CustomerMenu from './components/customer/CustomerMenu';
import AdminDashboard from './components/admin/AdminDashboard';
import MenuManagement from './components/admin/MenuManagement';
import OrderManagement from './components/admin/OrderManagement';
import CategoryManagement from './components/admin/CategoryManagement';

const theme = createTheme({
  palette: {
    primary: {
      main: '#d84315', // Restaurant orange
    },
    secondary: {
      main: '#6d4c41', // Warm brown
    },
    background: {
      default: '#fafafa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, pt: 2 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/menu" replace />} />
              <Route path="/menu" element={<CustomerMenu />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/menu" element={<MenuManagement />} />
              <Route path="/admin/orders" element={<OrderManagement />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
