import React, { useState } from 'react';
import {useLocation, useNavigate } from 'react-router-dom'; // Adjust if using a different router
import axios from 'axios';
import {Box, Button, Container, TextField,  Typography } from '@mui/material';
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false); 
  const location = useLocation();

  // Extract the reset token from the URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const handlePasswordReset = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    try {
      // Make an API call to reset the password
      const response = await axios.post(`${apiBaseUrl}/auth/reset-password`, {
        token,
        password,
      });

      setSuccess(response.data.message);
      // Navigate to the login page after successful reset
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError('Error resetting password. Please try again.');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ backgroundColor: 'white', padding: 2, borderRadius: 2, mt: 4 }}>
      <Typography variant="h5">Reset Password</Typography>
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="success">{success}</Typography>}
      <TextField
        label="New Password"
        type="password"
        fullWidth
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
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
        label="Confirm Password"
        type="password"
        fullWidth
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handlePasswordReset}
        sx={{ mt: 2 }}
      >
        Reset Password
      </Button>
    </Container>
  );
};

export default ResetPassword;
