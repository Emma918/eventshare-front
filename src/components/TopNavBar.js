import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Box, Typography, IconButton, Menu, MenuItem, Drawer, List, ListItem } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu'; // 导入菜单图标
import '../App.css';
import { Link } from 'react-router-dom';
import ChangePasswordDialog from '../pages/ChangePasswordDialog';
import EditProfileDialog from '../pages/EditProfileDialog';

const TopNavBar = ({ isLoggedIn, userName, userRole, userEmail, anchorEl, open, setIsLoggedIn, setAnchorEl }) => {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);  // 控制 Drawer 的状态

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
  const handleDrawerOpen = () => setDrawerOpen(true);  // 打开 Drawer
  const handleDrawerClose = () => setDrawerOpen(false);  // 关闭 Drawer

  return (
    <AppBar position="static" className="nav-bar">
      <Toolbar>
        {/* 左侧导航按钮 */}
        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          <Button color="inherit" className="nav-button" href="/">Home</Button>
          <Button color="inherit" className="nav-button" onClick={handleEventsOpen}>Events</Button>
        </Box>

        {/* 右侧登录或用户信息按钮 */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
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

        {/* 小屏幕下的抽屉按钮 */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
          <IconButton size="large" edge="end" color="inherit" onClick={handleDrawerOpen}>
            <MenuIcon /> {/* 菜单图标 */}
          </IconButton>
        </Box>

        {/* Drawer 组件 */}
        <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
         <List>
         <ListItem button component={Link} to="/login" className="nav-button">Log in</ListItem>
         <ListItem button component={Link} to="/register" className="nav-button">Sign up</ListItem>
         <ListItem button component={Link} to="/contact-us" className="nav-button">Contact Us</ListItem>
         </List>
       </Drawer>
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
