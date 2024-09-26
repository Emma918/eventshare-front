import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle,FormControl,InputLabel, Button, MenuItem, TextField, Select, Grid, Box } from '@mui/material';
import axios from 'axios';

const ReservationDialog = ({ open, onClose, event, normalUserDetail, refreshReservedEvents }) => {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [reservation, setReservation] = useState({
    eventId: event ? event.eventId : '',
    date: event && !event.repeat ? event.date : '',
    name: '',
    gender: '',
    phone: '',
    email: '',
    nationality: '',
    firstLanguage: ''
  });

  useEffect(() => {
    if (event && event.weekday) {
      fetch(`${apiBaseUrl}/api/${event.eventId}/weekdays?weekday=${event.weekday}&capacity=${event.capacity}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch dates');
          }
          return response.json();
        })
        .then((data) => {
          setAvailableDates(data);
        })
        .catch((error) => {
          console.error('Error fetching dates:', error);
        });
    }
  }, [apiBaseUrl,event]);

  useEffect(() => {
    if (normalUserDetail) {
      setReservation((prev) => ({
        ...prev,
        name: normalUserDetail.name || '',
        gender: normalUserDetail.gender || '',
        phone: normalUserDetail.phone || '',
        email: normalUserDetail.email || '',
        nationality: normalUserDetail.nationality || '',
        firstLanguage: normalUserDetail.firstLanguage || ''
      }));
    }
    //if (event) {
    //  setReservation((prev) => ({
    //    ...prev,
    //    eventId: event.eventId || '',  // Make sure eventId is set
   //     date: event.repeat ? '' : event.date,  // Set date if not repeating
    //  }));
   // }
    
  }, [normalUserDetail,event]);

  const handleChange = (e) => {
    setReservation({ ...reservation, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setReservation((prev) => ({
      ...prev,
      date: e.target.value  // Update the reservation with the selected date
    }));
  };

  const handleSubmit = async () => {
    try {
      console.log('reservation:',reservation);
      await axios.post(`${apiBaseUrl}/api/events/reservations/${event.eventId}`, reservation);
      alert('Reservation successful!');
      refreshReservedEvents(); // Refresh reserved events after a successful reservation
      onClose();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert('You have already reserved this event for this date.'); // 弹出错误提示
      } else {
        alert('Failed to reserve the event. Please try again later.');
      }
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Reserve Event</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {event && !event.repeat && event.startdate===event.enddate? (
                <TextField label="Date"name="date"value={event.startdate}disabled fullWidth variant="outlined"
                InputProps={{
                  style: { height: '56px' }}}/>
              ) : (
                <FormControl fullWidth required variant="outlined"> 
                <InputLabel id="date">Date</InputLabel>
                <Select
                  label="Date"
                  name="date"
                  value={selectedDate}
                  onChange={handleDateChange}  // Handle date change
                  fullWidth
                  required
                  variant="outlined"
                >
                  {availableDates.map((date, index) => (
                    <MenuItem key={index} value={date}>
                      {date}
                    </MenuItem>
                  ))}
                </Select>
                </FormControl>
              )}
            </Grid>
          <Grid item xs={12}>
            <TextField
              label="Name"
              name="name"
              value={reservation.name}
              onChange={handleChange}
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
              label="Gender"
              name="gender"
              value={reservation.gender}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputProps={{
                style: { height: '56px' }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Phone"
              name="phone"
              value={reservation.phone}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputProps={{
                style: { height: '56px' }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              name="email"
              value={reservation.email}
              onChange={handleChange}
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
              label="Nationality"
              name="nationality"
              value={reservation.nationality}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputProps={{
                style: { height: '56px' }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="First Language"
              name="firstLanguage"
              value={reservation.firstLanguage}
              onChange={handleChange}
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
        Reserve
      </Button>
    </DialogActions>
  </Dialog>
  );
};

export default ReservationDialog;
