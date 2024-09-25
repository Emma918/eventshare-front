import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import axios from 'axios';

function RequestPasswordReset() {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
        <Button
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
