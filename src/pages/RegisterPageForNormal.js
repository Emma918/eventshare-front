import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, IconButton, InputAdornment } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import '../App.css';

function RegisterPage() {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showPassword, setShowPassword] = useState(false);  // State for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);  // State for confirm password visibility
  const [error, setError] = useState('');
  const navigate = useNavigate();  // Initialize useNavigate
  const location = useLocation();
  // Handle go back action
  const handleGoBack = () => {
    navigate(-1);  // This navigates back to the previous page
  };

  // Toggle visibility for password
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle visibility for confirm password
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
      const role = 'normal';
      await axios.post(`${apiBaseUrl}/auth/register`, { email, password, role });
      navigate('/login', { state: { from: '/register', prevPage: location.state?.from || '/' } });
      alert('Registration successful! Please check your email for verification.');
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
          position: 'relative'
        }}
      >
        {/* Go Back button aligned to the left */}
        <IconButton className="button"
          sx={{ position: 'absolute', left: 0, top: 0 }}
          onClick={handleGoBack}
          color="primary">
          <ArrowBackIcon /> {/* Arrow back icon */}
        </IconButton>
        <Typography component="h1" variant="h5">
          Register
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
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setShowPasswordRequirements(true)}
            onBlur={() => setShowPasswordRequirements(false)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                    sx={{
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* Password Requirements */}
          {showPasswordRequirements && (
            <Box sx={{ backgroundColor: '#f9f9f9', padding: 2, borderRadius: 2, mt: 1 }}>
              <Typography variant="body2" sx={{ color: 'gray' }}>
                Password must be at least 8 characters long and contain:One uppercase letter,
                One lowercase letter and One number.
              </Typography>
            </Box>)}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}  // Independent visibility for confirm password
            id="confirmPassword"
            autoComplete="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={toggleConfirmPasswordVisibility}
                    edge="end"
                    sx={{
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
          Already have an account?{' '}
          <Link
            to={'/login'}
            state={{
              from: '/register',
              prevPage: location.state?.from || '/'
            }}
          >
            Sign in here
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default RegisterPage;
