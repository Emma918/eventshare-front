import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Tabs, Tab, Box, TextField, Button, Typography, Container } from '@mui/material';
import axios from 'axios';

function RegisterPage() {
  const [selectedTab, setSelectedTab] = useState(0);  // 0 = Normal, 1 = Admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: 'YOUR_FACEBOOK_APP_ID',
        cookie: true,
        xfbml: true,
        version: 'v12.0',
      });
    };

    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleRegister = async () => {
    try {
      const role = selectedTab === 0 ? 'normal' : 'admin';
      await axios.post('http://localhost:5000/auth/register', { email, password, role });
      alert('Registration successful! Please login.');
      window.location.href = '/login';
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  const handleGoogleSuccess = (response) => {
    console.log('Google success', response);
  };

  const handleFacebookLogin = () => {
    window.FB.login(function(response) {
      console.log('Facebook login success', response);
    }, { scope: 'public_profile,email' });
  };

  const handleAppleLogin = () => {
    window.AppleID.auth.signIn();
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Register
        </Typography>

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleRegister}
          >
            Sign Up
          </Button>
        </Box>

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
          onClick={handleAppleLogin}
        >
          Sign in with Apple
        </Button>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account? <a href="/login">Sign in here</a>
        </Typography>
      </Box>
    </Container>
  );
}

export default RegisterPage;
