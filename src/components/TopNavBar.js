import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import '../App.css';
import { Link } from 'react-router-dom';
import ChangePasswordDialog from '../pages/ChangePasswordDialog';
import EditProfileDialog from '../pages/EditProfileDialog';

const TopNavBar = ({ isLoggedIn, userName, userRole, userEmail, anchorEl, open, setIsLoggedIn, setAnchorEl }) => {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);  // 控制汉堡包菜单

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    //window.location.href = '/homepage';
    window.location.href = '/normal-dashboard';
    
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

  const handleMenuOpen = (e) => {
    if (anchorEl) {
      // 如果 Menu 已经打开，则关闭它
      setAnchorEl(null);
    } else {
      // 否则打开 Menu
      setAnchorEl(e.currentTarget);
    }
  };
  const handleHamburgerMenuOpen = (e) => {
    if (menuAnchorEl) {
      // 如果 Menu 已经打开，则关闭它
      setMenuAnchorEl(null);
    } else {
      // 否则打开 Menu
      setMenuAnchorEl(e.currentTarget);
    }
  };
  const handleHamburgerMenuClose = () => setMenuAnchorEl(null);

  return (
    <>
      {/* 导航栏 */}
      <AppBar position="fixed" className="nav-bar" sx={{ zIndex: 1400 }}>
        <Toolbar sx={{ justifyContent: 'center', padding: 0 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              maxWidth: '1000px', // 限制宽度为1000px
              width: '100%',
              margin: '0 auto', // 使其居中
            }}
          >
            {/* 左侧导航按钮 */}
           {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
               <Button 
                color="inherit" 
                className="nav-button" 
                href="/homepage" 
                sx={{ fontSize: { xs: '0.75rem', sm: '1rem' }, padding: { xs: '4px 8px', sm: '10px 16px' }, marginRight: { xs: '8px', sm: '16px' } }}
              >
                Home
              </Button>
              <Button 
                color="inherit" 
                className="nav-button" 
                onClick={handleEventsOpen} 
                sx={{ fontSize: { xs: '0.75rem', sm: '1rem' }, padding: { xs: '4px 8px', sm: '10px 16px' }, marginRight: { xs: '8px', sm: '16px' } }}
              >
                Events
              </Button>
            </Box>*/}
            <Typography
              variant="h6"
              sx={{
                fontStyle: 'italic', // 字体倾斜
                fontWeight: 'bold',
                letterSpacing: 1.2,
                ml: 2, // 左侧留点间距
              }}
            >
              kiwiboard.info
            </Typography>

            {/* 在小屏幕下，使用汉堡包菜单代替部分按钮 */}
            <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center' }}>
              <IconButton edge="start" color="inherit" onClick={handleHamburgerMenuOpen}>
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleHamburgerMenuClose}
              >
                <MenuItem component={Link} to="/contact-us">Contact Us</MenuItem>
                {!isLoggedIn && [
                  <MenuItem component={Link} to="/login">Log in</MenuItem>,
                  <MenuItem component={Link} to="/register">Sign up</MenuItem>
                ]}
                {isLoggedIn && [
                  <MenuItem onClick={() => { setIsChangePasswordOpen(true); setMenuAnchorEl(null); }}>Change Password</MenuItem>,
                  <MenuItem onClick={() => { setIsEditProfileOpen(true); setMenuAnchorEl(null); }}>Edit Profile</MenuItem>,
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                ]}
              </Menu>
            </Box>

            {/* 右侧登录或者用户信息，在大屏幕上显示 */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' }, // 在大屏幕上显示，手机模式隐藏
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '0.75rem', sm: '1rem' },
                padding: { xs: '4px', sm: '10px' },
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
                    <MenuItem onClick={() => { setIsChangePasswordOpen(true); setAnchorEl(null); }}>Change Password</MenuItem>
                    <MenuItem onClick={() => { setIsEditProfileOpen(true); setAnchorEl(null); }}>Edit Profile</MenuItem>
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
          </Box>
        </Toolbar>
      </AppBar>

      {/* 添加填充内容，确保内容不会被导航栏遮挡 */}
      <Box sx={{ marginTop: '64px' }} />

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
    </>
  );
};

export default TopNavBar;
