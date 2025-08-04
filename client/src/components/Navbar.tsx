import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton
} from '@mui/material';
import { Restaurant, AdminPanelSettings, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <IconButton 
          edge="start" 
          color="inherit" 
          aria-label="restaurant"
          sx={{ mr: 2 }}
        >
          <Restaurant />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Restaurant Management
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            color="inherit" 
            onClick={() => navigate('/menu')}
            variant={location.pathname === '/menu' ? 'outlined' : 'text'}
            startIcon={<MenuIcon />}
          >
            Customer Menu
          </Button>
          
          <Button 
            color="inherit" 
            onClick={() => navigate('/admin')}
            variant={location.pathname.startsWith('/admin') ? 'outlined' : 'text'}
            startIcon={<AdminPanelSettings />}
          >
            Admin Panel
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;