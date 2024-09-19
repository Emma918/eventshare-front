import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Tabs, Tab, Box, TextField, Button, Typography, Container } from '@mui/material';
import axios from 'axios';

function LoginPage({ setUserRole }) {
  const [selectedTab, setSelectedTab] = useState(0);  // 0 = Normal, 1 = Admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
 {/* 
  useEffect(() => {
    // Load Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: 'YOUR_FACEBOOK_APP_ID',
        cookie: true,
        xfbml: true,
        version: 'v12.0',
      });
    };

    // Load Apple SDK
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);
*/}
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  const handleLogin = async () => {
    try {
      const role = selectedTab === 0 ? 'normal' : 'admin';
      const response = await axios.post('http://localhost:5000/auth/login', { email, password, role });
      localStorage.setItem('userRole', role);  // 保存用户角色
      localStorage.setItem('userEmail', email);  // 保存用户角色
      setUserRole(role);
      if (role === 'admin') {
        window.location.href = '/admin-dashboard';
      } else {
        window.location.href = '/normal-dashboard';
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    }
  };
{/*
  const handleGoogleSuccess = (response) => {
    console.log('Google success', response);
    // Handle Google login on server-side
  };

  const handleFacebookLogin = () => {
    window.FB.login(function(response) {
      if (response.authResponse) {
        console.log('Facebook login success', response);
        // Handle Facebook login on server-side
      }
    }, { scope: 'public_profile,email' });
  };

  const handleAppleLogin = () => {
    window.AppleID.auth.init({
      clientId: 'YOUR_APPLE_CLIENT_ID',
      scope: 'name email',
      redirectURI: 'YOUR_REDIRECT_URI',
      state: 'STATE',
      usePopup: true,
    });
    window.AppleID.auth.signIn();
  };
*/}
  return (
    <Container component="main" maxWidth="xs" sx={{ backgroundColor: 'white', padding: 2, borderRadius: 2,mt : 4  }}>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>

        {/* Tabs for Admin/Normal */}
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="user type tabs">
          <Tab label="Normal User" />
          <Tab label="Admin User" />
        </Tabs>

        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
          >
            Sign In
          </Button>
        </Box>
{/*
        <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Google Login Failed')}
          />
        </GoogleOAuthProvider>
        <Button
          fullWidth
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={handleFacebookLogin}
        >
          Sign in with Facebook
        </Button>
        <Button
          fullWidth
          variant="outlined"
          sx={{ mt: 2 }}
          id="appleid-signin"
          onClick={handleAppleLogin}
        >
          Sign in with Apple
        </Button>
*/}
        <Typography variant="body2" sx={{ mt: 2 }}>
          New user? <a href="/register">Register here</a>
        </Typography>
      </Box>
    </Container>
  );
}

export default LoginPage;
