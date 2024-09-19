import React from 'react';
import { AppBar, Toolbar, Button, Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import '../App.css'; // Import the styles

const TopNavBar = ({ isLoggedIn, userName, anchorEl, open, handleEventsOpen, handleMenuOpen, handleMenuClose, handleLogout, setIsChangePasswordOpen, setIsEditProfileOpen }) => {
  return (
    <AppBar position="static" className="nav-bar">
      <Toolbar>
        {/* Left-aligned navigation links */}
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          <Button color="inherit" className="nav-button" href="/">Home</Button>
          <Button color="inherit" className="nav-button" onClick={handleEventsOpen}>Events</Button>
           {/* <Button color="inherit" className="nav-button" href="/events">Event</Button> */}
        </Box>

        {/* Right-aligned login or user info */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>{userName}</Typography>
              <IconButton size="large" edge="end" color="inherit" onClick={handleMenuOpen}>
                <AccountCircle />  
              </IconButton>
              <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                <MenuItem onClick={() => setIsChangePasswordOpen(true)}>Change Password</MenuItem>
                <MenuItem onClick={() => setIsEditProfileOpen(true)}>Edit Profile</MenuItem>
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
    </AppBar>
  );
};

export default TopNavBar;
