import React, {useEffect,useState } from 'react';
import axios from 'axios';
import { Box, Button, Dialog,FormControl,InputLabel,Select,MenuItem,IconButton, TextField, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { Close,Delete  } from '@mui/icons-material';
import ReactQuill from 'react-quill'; 
import 'react-quill/dist/quill.snow.css'; 
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const AddEditEventDialog = ({ open, onClose, newEvent, setNewEvent, handleEventSubmit,isEdit  }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [eventCategorys, setCategorys] = useState([]);
  const [englishLevels, setEnglishLevels] = useState([]);
  useEffect(() => {
    if (newEvent.images) {
      setExistingImages(newEvent.images);
    }
    //get category
    const getCategory = async () => {
      const response = await axios.get(`${apiBaseUrl}/api/columns/Event category`);
      if(response.length !==0){
        setCategorys(response.data); 
    }
    };
    getCategory();
    //get level
    const getLevel = async () => {
      const response = await axios.get(`${apiBaseUrl}/api/columns/English Level`);
      if(response.length !==0){
        setEnglishLevels(response.data); 
    }
    };
    getLevel();
  }, [newEvent]);
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);

    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previewUrls);
  }; 
  const handleDeleteExistingImage = async (index) => {
    try {
      // Delete image from the server
      const imagePath = existingImages[index].imagePath.replace(/\\/g, '/'); // Replace backslashes with forward slashes
      const encodedImagePath = encodeURIComponent(imagePath);
      await axios.delete(`${apiBaseUrl}/api/eventImage/${newEvent.eventId}?imagePath=${encodedImagePath}`);
      
      // Update state to remove the image from the UI
      const updatedExistingImages = existingImages.filter((_, i) => i !== index);
      setExistingImages(updatedExistingImages);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };
  
  const handleDeleteImage = (index) => {
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    setImagePreviews(updatedPreviews);
  };

  const handleEvent = () => {
    const formData = new FormData();
    formData.append('email', newEvent.email);
    formData.append('title', newEvent.title);
    formData.append('startdate', newEvent.startdate);
    formData.append('enddate', newEvent.enddate);
    formData.append('startTime', newEvent.startTime);
    formData.append('endTime', newEvent.endTime);
    formData.append('location', newEvent.location);
    formData.append('capacity', newEvent.capacity);
    formData.append('level', newEvent.level);
    formData.append('isFree', newEvent.isFree);
    formData.append('reserve', newEvent.reserve);
    formData.append('repeat', newEvent.repeat);
    formData.append('organizer', newEvent.organizer);
    formData.append('description', newEvent.description);
    formData.append('category', newEvent.category);
    if(selectedImages.length>0){
      selectedImages.forEach((image, index) => {
      formData.append('images', image);
    });
  }
      handleEventSubmit(formData); // Send form data to backend
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="sm">
      <Box sx={{ padding: 3, display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '90vh', overflow: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h5">{isEdit ? 'Edit Event' : 'Add New Event'}</Typography>
          <IconButton onClick={onClose}><Close /></IconButton>
        </Box>
        <FormControl fullWidth required>
          <InputLabel>Category</InputLabel>
          <Select label="Category"value={newEvent.category}onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}>
             {eventCategorys.map((categorys, index) => (
              <MenuItem key={index} value={categorys.columnSeq}>
              {categorys.columnDetail}
              </MenuItem>
             ))} 
            </Select>
        </FormControl>
        <TextField label="Title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} fullWidth required />
        <Box sx={{ display: 'flex', justifyContent: 'space-between',  gap: 2,mt: 1 }}>
           <TextField label="Start Date" type="date" value={newEvent.startdate || ''} onChange={(e) => setNewEvent({ ...newEvent, startdate: e.target.value })} fullWidth required InputLabelProps={{ shrink: true }} />
           <TextField label="End Date" type="date" value={newEvent.enddate || ''} onChange={(e) => setNewEvent({ ...newEvent, enddate: e.target.value })} fullWidth  required InputLabelProps={{ shrink: true }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between',  gap: 2,mt: 1 }}>
        <TextField label="Start Time" type="time" value={newEvent.startTime || ''} onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })} fullWidth required InputLabelProps={{ shrink: true }} />
          <TextField label="End Time" type="time" value={newEvent.endTime || ''} onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })} fullWidth required InputLabelProps={{ shrink: true }} />
        </Box>
        <TextField label="Organizer" value={newEvent.organizer} onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })} fullWidth required/>
        <TextField label="Location" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} fullWidth required />
        <TextField label="Capacity" type="number" value={newEvent.capacity} onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })} fullWidth inputProps={{ min: 0 }} />
        {newEvent.category === 1 && (
       <FormControl fullWidth required>
          <InputLabel>Level</InputLabel>
          <Select label="Level"value={newEvent.level}onChange={(e) => setNewEvent({ ...newEvent, level: e.target.value })}>
             {englishLevels.map((level, index) => (
              <MenuItem key={index} value={level.columnSeq}>
              {level.columnDetail}
              </MenuItem>
             ))} 
            </Select>
        </FormControl>)}
        <Typography variant="h6">Description</Typography>
        <ReactQuill theme="snow" value={newEvent.description} onChange={(value) => setNewEvent({ ...newEvent, description: value })} />
        <Typography variant="h6">Upload Images*(Up to 5 images)</Typography>
        <input type="file"name="images"accept="image/*"multiple onChange={handleImageChange}/>
         { existingImages&& existingImages.map((image, index) => (
          <Box key={index} sx={{ mt: 2, position: 'relative' }}>
            <img src={`${apiBaseUrl}/${image.imagePath}`} alt={`Existing  ${index}`} style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />
            <IconButton sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'white', borderRadius: '50%' }}onClick={() => handleDeleteExistingImage(index)}size="small"><Delete /></IconButton>
          </Box>
        ))}
        {imagePreviews && imagePreviews.map((preview, index) => (
          <Box key={index} sx={{ mt: 2, position: 'relative' }}>
            <img src={preview} alt={`Preview ${index}`} style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />
            <IconButton sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'white', borderRadius: '50%' }}onClick={() => handleDeleteImage(index)}size="small"><Delete /></IconButton>
          </Box>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <FormControlLabel control={<Checkbox checked={newEvent.isFree} onChange={(e) => setNewEvent({ ...newEvent, isFree: e.target.checked })} />} label="Free Event" />
          <FormControlLabel control={<Checkbox checked={newEvent.reserve} onChange={(e) => setNewEvent({ ...newEvent, reserve: e.target.checked })} />} label="Reserve need?" /> 
          <FormControlLabel control={<Checkbox checked={newEvent.repeat} onChange={(e) => setNewEvent({ ...newEvent, repeat: e.target.checked })} />} label="Repeat Weekly" />
        </Box>
        <Button variant="contained" onClick={handleEvent} fullWidth>{isEdit ? 'Save Changes' : 'Add Event'}</Button>
      </Box>
    </Dialog>
  );
};

export default AddEditEventDialog;
