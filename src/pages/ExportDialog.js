import React from 'react';
import { Dialog, DialogTitle, DialogContent, Select, MenuItem, DialogActions, Button } from '@mui/material';
import axios from 'axios';
import { saveAs } from 'file-saver'; // To download CSV files
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const ExportDialog = ({ open, onClose, eventId, availableDates, selectedDate, setSelectedDate }) => {
  const handleExport = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/events/${eventId}/reservations?date=${selectedDate}`);
      const reservations = response.data;

      if (reservations.length === 0) {
        alert('No reservations found for this date.');
        return;
      }

      // Generate CSV content
      let csvContent = "Date,Name,Gender,Phone,Email,Nationality,First Language\n"; // CSV header
      reservations.forEach(reservation => {
        const row = `${reservation.date},${reservation.name},${reservation.gender},${reservation.phone},${reservation.email},${reservation.nationality},${reservation.firstLanguage}\n`;
        csvContent += row;
      });

      // Export CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `reservations_${selectedDate}.csv`);
    } catch (error) {
      console.error('Error exporting reservations:', error);
    }
    onClose(); // Close the dialog after export
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select Date for Export</DialogTitle>
      <DialogContent>
        <Select
          label="Date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          fullWidth
        >
          {availableDates.map((date, index) => (
            <MenuItem key={index} value={date}>{date}</MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleExport}>Export</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
