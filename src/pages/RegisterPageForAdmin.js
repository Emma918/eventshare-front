import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Container } from '@mui/material';
import axios from 'axios';
import '../App.css';
function RegisterPage() {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      if (password !== confirmPassword) {
        setError('Passwords do not match!');
        return;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*><]{8,}$/;
      if (!passwordRegex.test(password)) {
        setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
        return;
      }
      const role = 'admin';
      await axios.post(`${apiBaseUrl}/auth/register`, { email, password, role });
      alert('Registration successful! Please login.');
      window.location.href = '/login';
    } catch (error) {
      if (error.response && error.response.data) {
        setError(`${error.response.data.message}`);  // Error message sent from backend
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };
  return (
    <Container component="main" maxWidth="xs" sx={{ backgroundColor: 'white', padding: 2, borderRadius: 2, mt: 4 }}>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Register for Admin
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
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setShowPasswordRequirements(true)} // Show password requirements on focus
            onBlur={() => setShowPasswordRequirements(false)} // Hide password requirements on blur
          />
          {/* Password Requirements */}
          {showPasswordRequirements && (
            <Box sx={{ backgroundColor: '#f9f9f9', padding: 2, borderRadius: 2, mt: 1 }}>
              <Typography variant="body2" sx={{ color: 'gray' }}>
                Password must be at least 8 characters long and contain:One uppercase letter,
                One lowercase letter, One number and One special character (e.g., @$!%*?&#)
              </Typography>
            </Box>)}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button className="button"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleRegister}
          >
            Sign Up
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account? <a href="/login">Sign in here</a>
        </Typography>
      </Box>
    </Container>
  );
}

export default RegisterPage;
