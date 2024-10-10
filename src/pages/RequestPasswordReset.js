import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
function RequestPasswordReset() {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();  // Initialize useNavigate
  // Handle go back action
  const handleGoBack = () => {
    navigate(-1);  // This navigates back to the previous page
  };
  const handleResetPassword = async () => {
    try {
      await axios.post(`${apiBaseUrl}/auth/request-password-reset`, { email });
      setMessage('A password reset link has been sent to your email.');
    } catch (error) {
      setMessage('Failed to send password reset email. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ backgroundColor: 'white', padding: 2, borderRadius: 2, mt: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        {/* Go Back button aligned to the left */}
        <IconButton className="button"
          sx={{ position: 'absolute', left: 0, top: 0 }}
          onClick={handleGoBack}
          color="primary">
          <ArrowBackIcon /> {/* Arrow back icon */}
        </IconButton>
        <Typography component="h1" variant="h5">Reset Password</Typography>
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
        <Button className="button"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={handleResetPassword}
        >
          Send Reset Link
        </Button>
        {message && <Typography variant="body2" color="primary">{message}</Typography>}
      </Box>
    </Container>
  );
}

export default RequestPasswordReset;
