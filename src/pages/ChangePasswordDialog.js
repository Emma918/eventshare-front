import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Grid, Box, Typography } from '@mui/material';
import axios from 'axios';

const ChangePasswordDialog = ({ open, onClose, userEmail }) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState(''); // 新增确认密码状态
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    // 检查新密码和确认新密码是否一致
    if (newPassword !== confirmNewPassword) {
      alert("The new passwords do not match. Please try again.");
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }
    try {
      await axios.post(`${apiBaseUrl}/auth/change-password`, {
        email: userEmail,
        oldPassword,
        newPassword
      });
      alert('Password changed successfully!');
      onClose();
    } catch (error) {
      alert('Failed to change password. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Old Password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                fullWidth
                required
                variant="outlined"
                InputProps={{
                  style: { height: '56px' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                required
                variant="outlined"
                InputProps={{
                  style: { height: '56px' }
                }}
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Confirm New Password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)} // 绑定确认密码的输入
                fullWidth
                required
                variant="outlined"
                InputProps={{
                  style: { height: '56px' }
                }}
              />
              {error && <Typography color="error">{error}</Typography>}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button className='button' onClick={handleSubmit} variant="contained" color="primary">
          Change
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
