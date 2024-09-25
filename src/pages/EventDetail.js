// src/pages/EventDetail.js
import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import '../App.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button,IconButton } from '@mui/material';
import TopNavBar from '../components/TopNavBar';
import ShareIcon from '@mui/icons-material/Share';
import DOMPurify from 'dompurify';
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const EventDetail = () => {
  const { eventId } = useParams(); // Get the event ID from the URL
  const [event, setEvent] = useState(null);
  const [userName, setUserName] = useState('');  // 初始化 userName 为空字符串
  const userEmail = localStorage.getItem('userEmail');  //用户的邮箱
  const userRole= localStorage.getItem('userRole');  //用户角色
  const [isLoggedIn, setIsLoggedIn] = useState(!!userEmail);  // 检查是否已登录
  const [anchorEl, setAnchorEl] = useState(null);  // 控制菜单
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Track the currently displayed image
  const open = Boolean(anchorEl);
  useEffect(() => {
    const fetchUserDetails = async () => {
   try {
    if (userRole === 'admin') {
     const response = await axios.get(`${apiBaseUrl}/api/admin-user-details/${userEmail}`);
     setUserName(response.data.adminName);
    } else {
      const response = await axios.get(`${apiBaseUrl}/api/normal-user-details/${userEmail}`);
      setUserName(response.data.name);  // 获取用户的 name 并赋值给 userName
    }   
   } catch (error) {
     console.error('Error fetching user details:', error);
   }
   };

 if (userEmail) {
   fetchUserDetails();  // 如果用户邮箱存在，则获取详细信息
 }
 }, [userEmail,userRole]);
  useEffect(() => {
    // Fetch event details using the event ID
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/events/${eventId}`);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  if (!event) {
    return <Typography>Loading...</Typography>;
  }

   // Handle moving to the next image
   const handleNextImage = (event) => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % event.images.length
    );
  };

  // Handle moving to the previous image
  const handlePrevImage = (event) => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex - 1 + event.images.length) % event.images.length
    );
  };
  const handleShareEvent = (event) => {
    if (navigator.share) {
      navigator
        .share({
          title: event.title,
          text: `Check out this event: ${event.title}`,
          url: `${apiBaseUrl}/events/${event.eventId}`,
        })
        .then(() => console.log('Event shared successfully'))
        .catch((error) => console.error('Error sharing the event:', error));
    } else {
      alert('Web Share API is not supported in this browser.');
    }
  };
  return (
    <div className="container">
       {/* 顶端任务栏 */}
       <TopNavBar
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={userRole}
        userEmail={userEmail}
        anchorEl={anchorEl}
        open={open}
        setIsLoggedIn={setIsLoggedIn}
        setAnchorEl={setAnchorEl}
      />
      <Box sx={{ padding: 3 }}>
      {event.images && event.images.length > 0 && (
            <Box className="event-image-container">
            {/* Display the current image */}
            <img
              src={`${apiBaseUrl}/${event.images[currentImageIndex].imagePath}`}
              alt={`Event Image ${currentImageIndex + 1}`}
              className="event-image"
            />
          
            {/* Left Arrow Button */}
            <Button
              onClick={() => handlePrevImage(event)}
              disabled={event.images.length <= 1}
              className="arrow-button left-arrow"
            >
              &lt;
            </Button>
          
            {/* Right Arrow Button */}
            <Button
              onClick={() => handleNextImage(event)}
              disabled={event.images.length <= 1}
              className="arrow-button right-arrow"
            >
              &gt;
            </Button>
          </Box>
      )}
      <Box className="event-header" sx={{ mt: 2 }}>
       <Typography className="event-title" variant="h5">
       {event.title}
       </Typography>
       <IconButton className="event-share-btn" onClick={() => handleShareEvent(event)}>
        <ShareIcon />
       </IconButton>
      </Box>
      <Typography variant="body1"><strong>Organizer:</strong>{event.organizer}</Typography>
      <Typography variant="body1"><strong>Date:</strong> {event.repeat ?`Every ${event.weekday}` 
              : event.startdate===event.enddate?
              event.startdate
              :`${event.startdate} ~ ${event.enddate}`}<br/></Typography>
      <Typography variant="body1"><strong>Start Time:</strong> {event.startTime}</Typography>
      <Typography variant="body1"><strong>End Time:</strong> {event.endTime}</Typography>
      <Typography variant="body1"><strong>Location:</strong> 
      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
        target="_blank" 
        rel="noopener noreferrer"
        style={{ color: 'black', textDecoration: 'underline' }}>
        {event.location}
      </a></Typography>
      <Typography variant="body1"><strong>Capacity:</strong> {event.capacity}</Typography>
      <Typography variant="body1"><strong>Level:</strong> {event.levelname}</Typography>
      <Typography variant="body1"><strong>Free:</strong> {event.isFree ? 'Yes' : 'No'}</Typography>
      <Typography variant="body1"><strong>Description:</strong></Typography>
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }}/>
      <Typography variant="body1"><strong>{event.reserve ? 'Reservation Required' : 'No Reservation Required'}</strong> </Typography>
      {/* Back button */}

      <Button variant="contained" className='button' onClick={() => window.history.back()} sx={{ mt: 2 }}>
        Go Back
      </Button>
    </Box>
    </div>
  );
};

export default EventDetail;
