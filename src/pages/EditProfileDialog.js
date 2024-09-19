import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Grid, Box } from '@mui/material';
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const EditProfileDialog = ({ open, onClose, userEmail, role }) => {
  const [profile, setProfile] = useState({
    name: '',
    gender: '',
    phone: '',
    nationality: '',
    firstLanguage: '',
    adminName: '',
    address: '',
    adminPhone: ''
  });

  useEffect(() => {
    // 从服务器获取用户的详细信息
    const fetchUserDetails = async () => {
      if (role === 'normal') {
        const response = await axios.get(`${apiBaseUrl}/api/normal-user-details/${userEmail}`);
        setProfile({
          name: response.data.name,
          gender: response.data.gender,
          phone: response.data.phone,
          nationality: response.data.nationality,
          firstLanguage: response.data.firstLanguage
        });
      } else if (role === 'admin') {
        const response = await axios.get(`${apiBaseUrl}/api/admin-user-details/${userEmail}`);
        setProfile({
          adminName: response.data.adminName,
          address: response.data.address,
          adminPhone: response.data.adminPhone
        });
      }
    };
    fetchUserDetails();
  }, [userEmail, role]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (role === 'normal') {
        await axios.post(`${apiBaseUrl}/api/normal-user-details/update/${userEmail}`, {
          name: profile.name,
          gender: profile.gender,
          phone: profile.phone,
          nationality: profile.nationality,
          firstLanguage: profile.firstLanguage
        });
      } else if (role === 'admin') {
        await axios.post(`${apiBaseUrl}/api/admin-user-details/update/${userEmail}`, {
          adminName: profile.adminName,
          address: profile.address,
          adminPhone: profile.adminPhone
        });
      }
      alert('Profile updated successfully!');
      onClose();
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* 如果是普通用户，显示姓名、性别、电话等字段 */}
            {role === 'normal' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    label="Name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Gender"
                    name="gender"
                    value={profile.gender}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Nationality"
                    name="nationality"
                    value={profile.nationality}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="First Language"
                    name="firstLanguage"
                    value={profile.firstLanguage}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </>
            )}

            {/* 如果是 admin 用户，显示教堂信息 */}
            {role === 'admin' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    label="admin Name"
                    name="adminName"
                    value={profile.adminName}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Admin Phone"
                    name="adminPhone"
                    value={profile.adminPhone}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileDialog;
