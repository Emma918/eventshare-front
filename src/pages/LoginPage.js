import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Container, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
function LoginPage() {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Add state for showing password
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();  // Initialize useNavigate
  const location = useLocation();
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('verified') === 'success') {
      setSuccessMessage('Email verified successfully! You can now log in.');
    }
  }, [location]);
  const handleLogin = async () => {
    try {
      const response = await axios.post(`${apiBaseUrl}/auth/login`, { email, password });
      // Extract token and role from the response
      const { token, role, userId } = response.data;
      localStorage.setItem('userRole', role);  // 保存用户角色
      localStorage.setItem('userEmail', email);  // 保存用户角色
      localStorage.setItem('userId', userId);
      localStorage.setItem('token', token)
      // Check if the user was coming from the registration page
      const fromRegistration = location.state?.from === '/register';
      // Redirect based on the previous location
      if (fromRegistration && location.state?.prevPage) {
        navigate(location.state.prevPage); // Navigate to the page before registration
      } else {
        navigate(location.state?.from || -1); // Navigate to previous page or fallback to last page
      }
    } catch (error) {
      console.log(error);
      setError('Login failed. Please check your email address or password.');
    }
  };

  // Handle go back action
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);  // 如果有上一页，则返回上一页
    } else {
      navigate('/normal-dashboard');
      //navigate('/homepage');  // 否则跳转到主页
    }
  };
  return (
    <Container component="main" maxWidth="xs" sx={{ backgroundColor: 'white', padding: 2, borderRadius: 2, mt: 4 }}>
      {successMessage && <Typography color="success" sx={{ mt: 2 }}>{successMessage}</Typography>}
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative' // To position the Go Back button
        }}
      >
        {/* Go Back button aligned to the left */}
        <IconButton className="button"
          sx={{ position: 'absolute', left: 0, top: 0 }}
          onClick={handleGoBack}
          color="primary"
        >
          <ArrowBackIcon /> {/* Arrow back icon */}
        </IconButton>
        {/* Centered Login heading */}
        <Typography component="h1" variant="h5" sx={{ textAlign: 'center', width: '100%' }}>
          Login
        </Typography>

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
            type={showPassword ? 'text' : 'password'}  // Toggle between text and password types
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Show Password Checkbox */}
          <FormControlLabel
            control={<Checkbox checked={showPassword} onChange={() => setShowPassword(!showPassword)} />}
            label="Show Password"
          />

          <Typography variant="body2" sx={{ mt: 1 }}>
            Forgot your password? <a href="/forgot-password">Reset here</a>
          </Typography>

          {error && <Typography color="error">{error}</Typography>}

          <Button className="button"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
          >
            Sign In
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 1 }}>
          New user? <a href="/register">Register here</a>
        </Typography>
      </Box>
    </Container>
  );
}

export default LoginPage;
