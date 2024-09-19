import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Grid, Box } from '@mui/material';
import axios from 'axios';

const ChangePasswordDialog = ({ open, onClose, userEmail }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState(''); // 新增确认密码状态

  const handleSubmit = async () => {
    // 检查新密码和确认新密码是否一致
    if (newPassword !== confirmNewPassword) {
      alert("The new passwords do not match. Please try again.");
      return;
    }

    try {
      await axios.post('http://localhost:5000/auth/change-password', {
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
                variant="outlined"
                InputProps={{
                  style: { height: '56px' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Confirm New Password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)} // 绑定确认密码的输入
                fullWidth
                variant="outlined"
                InputProps={{
                  style: { height: '56px' }
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Change
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
