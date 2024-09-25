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
      <Toolbar>
        {/* Left-aligned navigation links */}
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          <Button color="inherit" className="nav-button" href="/">Home</Button>
          <Button color="inherit" className="nav-button" onClick={handleEventsOpen}>Events</Button>
        </Box>

        {/* Right-aligned login or user info */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button color="inherit" className="nav-button" component={Link} to="/contact-us">Contact Us</Button>
          {isLoggedIn ? (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>{userName}</Typography>
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
              <Button color="inherit" className="nav-button" href="/login">Log in</Button>
              <Button color="inherit" className="nav-button" href="/register">Sign up</Button>
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
