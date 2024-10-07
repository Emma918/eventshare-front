import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import '../App.css';
import { Link } from 'react-router-dom';
import ChangePasswordDialog from '../pages/ChangePasswordDialog';
import EditProfileDialog from '../pages/EditProfileDialog';

const TopNavBar = ({ isLoggedIn, userName, userRole, userEmail, anchorEl, open, setIsLoggedIn, setAnchorEl }) => {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = '/homepage';
  };

  const handleEventsOpen = () => {
    try {
      if (userRole === 'admin') {
        window.location.href = '/admin-dashboard';
      } else {
        window.location.href = '/normal-dashboard';
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);

  return (
    <AppBar position="static" className="nav-bar">
      <Toolbar sx={{ whiteSpace: 'nowrap', overflow: 'hidden', justifyContent: 'space-between' }}>
        {/* Left-aligned navigation links */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Button 
            color="inherit" 
            className="nav-button" 
            href="/" 
            sx={{ fontSize: { xs: '0.75rem', sm: '1rem' }, padding: { xs: '4px', sm: '10px' } }}
          >
            Home
          </Button>
          <Button 
            color="inherit" 
            className="nav-button" 
            onClick={handleEventsOpen} 
            sx={{ fontSize: { xs: '0.75rem', sm: '1rem' }, padding: { xs: '4px', sm: '10px' } }}
          >
            Events
          </Button>
        </Box>

        {/* Right-aligned login or user info */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            fontSize: { xs: '0.75rem', sm: '1rem' },
            padding: { xs: '4px', sm: '10px' },
            gap: '8px'  // Add small gap between buttons
          }}
        >
          <Button 
            color="inherit" 
            className="nav-button" 
            component={Link} 
            to="/contact-us"
            sx={{ fontSize: { xs: '0.75rem', sm: '1rem' }, padding: { xs: '4px', sm: '10px' } }}
          >
            Contact Us
          </Button>
          {isLoggedIn ? (
            <>
              <Typography variant="body1" sx={{ mr: 2, fontSize: { xs: '0.75rem', sm: '1rem' } }}>{userName}</Typography>
              <IconButton size="large" edge="end" color="inherit" onClick={handleMenuOpen}>
                <AccountCircle />
              </IconButton>
              <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => {setIsChangePasswordOpen(true);setAnchorEl(null);}}>Change Password</MenuItem>
                <MenuItem onClick={() => {setIsEditProfileOpen(true);setAnchorEl(null);}}>Edit Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                className="nav-button" 
                href="/login"
                sx={{ fontSize: { xs: '0.75rem', sm: '1rem' }, padding: { xs: '4px', sm: '10px' } }}
              >
                Log in
              </Button>
              <Button 
                color="inherit" 
                className="nav-button" 
                href="/register"
                sx={{ fontSize: { xs: '0.75rem', sm: '1rem' }, padding: { xs: '4px', sm: '10px' } }}
              >
                Sign up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>

      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userEmail={userEmail}
      />

      <EditProfileDialog
        open={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        userEmail={userEmail}
        role={userRole}
      />
    </AppBar>
  );
};

export default TopNavBar;
