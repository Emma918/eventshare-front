// src/pages/EventDetail.js
import React, { useEffect, useState } from 'react';
import '../App.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, IconButton } from '@mui/material';
import TopNavBar from '../components/TopNavBar';
import ShareIcon from '@mui/icons-material/Share';
import DOMPurify from 'dompurify';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReservationDialog from './ReservationDialog';
import { useLocation, useNavigate } from 'react-router-dom';
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const apiAppUrl = process.env.REACT_APP_API_FRONTEND_URL;
const EventDetail = () => {
  const { eventId } = useParams(); // Get the event ID from the URL
  const [event, setEvent] = useState(null);
  const [userName, setUserName] = useState('');  // 初始化 userName 为空字符串
  const userEmail = localStorage.getItem('userEmail');  //用户的邮箱
  const userRole = localStorage.getItem('userRole');  //用户角色
  const userId = localStorage.getItem('userId');
  const [isLoggedIn, setIsLoggedIn] = useState(!!userEmail);  // 检查是否已登录
  const [anchorEl, setAnchorEl] = useState(null);  // 控制菜单
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Track the currently displayed image
  const open = Boolean(anchorEl);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null); // 当前选中的课程ID
  const [reservedEvents, setReservedEvents] = useState([]);
  const [normalUserDetail, setNormalUserDetail] = useState(null); // 存储用户详细信息
  const location = useLocation();
  const navigate = useNavigate();
  const viewMode = location.state?.viewMode || 'list';
  const from = location.state?.from || null;
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (userRole === 'admin') {
          const response = await axios.get(`${apiBaseUrl}/api/admin-user-details/${userEmail}`);
          setUserName(response.data.adminName);
        } else {
          const response = await axios.get(`${apiBaseUrl}/api/normal-user-details/${userEmail}`);
          setUserName(response.data.name);  // 获取用户的 name 并赋值给 userName
          setNormalUserDetail(response.data);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    if (userEmail) {
      fetchUserDetails();  // 如果用户邮箱存在，则获取详细信息
    }
  }, [userEmail, userRole]);
  useEffect(() => {
    // Fetch event details using the event ID
    const fetchEventDetails = async () => {
      try {
        let response;
        if (isLoggedIn) {
          response = await axios.get(`${apiBaseUrl}/api/events/${eventId}`, {
            params: {
              userId: userId
            }
          });
        }
        else {
          response = await axios.get(`${apiBaseUrl}/api/events/${eventId}`);
        }
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
    if (isLoggedIn) {
      if (navigator.share) {
        navigator
          .share({
            title: event.title,
            text: `Check out this event: ${event.title}`,
            url: `${apiAppUrl}/events/${event.eventId}`,
          })
          .then(() => console.log('Event shared successfully'))
          .catch((error) => console.error('Error sharing the event:', error));
      } else {
        const fallbackUrl = `${apiAppUrl}/events/${event.eventId}`;
        navigator.clipboard.writeText(fallbackUrl)
          .then(() => {
            alert('Browser does not support sharing, but the event URL has been copied to your clipboard.');
          })
          .catch((error) => {
            console.error('Error copying URL to clipboard:', error);
            alert('Web Share API is not supported in this browser. Unable to share the event.');
          });
      }
    } else {
      navigate('/login');
    }
  };
  const handleLike = async (eventId) => {
    if (isLoggedIn) {
      try {
        // Send a request to the backend to update the like count for the event
        const response = await axios.post(`${apiBaseUrl}/api/events/${eventId}/like`, { userId });

        // Update the local event state with the new like count
        setEvent((prevEvent) => ({
          ...prevEvent,  // Spread the previous event properties
          likes: response.data.likes,  // Update the likes count
          liked: response.data.liked,  // Update the liked status
        }));
      } catch (error) {
        console.error('Error updating like:', error);
      }
    } else {
      navigate('/login');
    }
  };
  // 点击课程卡片进行预约
  const handleReserveClick = (event) => {
    if (isLoggedIn) {
      setSelectedEvent(event); // 设置选中的课程
      setIsReservationOpen(true); // 打开预约窗口
      console.log('Selected event:', event)
    } else {
      navigate('/login');
    }
  };
  const handleGoBack = () => {
    // 如果是从 NormalDashboard 跳转过来，返回时带上 viewMode
    if (from === 'NormalDashboard') {
      navigate('/normal-dashboard', { state: { viewMode: viewMode } });
    } else {
      // 否则执行默认的回退操作
      window.history.back();
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
      <Box sx={{ marginTop: 8, padding: 3, position: 'relative' }}>
        <IconButton className="button"
          sx={{ position: 'absolute', left: 0, top: 0 }}
          onClick={handleGoBack}
          color="primary"
        >
          <ArrowBackIcon />
        </IconButton>
        {event.images && event.images.length > 0 && (
          <Box className="event-image-container">
            {/* Display the current image */}
            <img
              src={`${event.images[currentImageIndex]}`}
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
        <Box className="event-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          {/* Title on the left */}
          <Typography className="event-title" variant="h5">
            {event.title}
          </Typography>

          {/* Buttons on the right */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton className="event-share-btn" onClick={() => handleShareEvent(event)}>
              <ShareIcon />
            </IconButton>
            <Typography variant="body2">Share</Typography>
            <IconButton className="like-button" onClick={() => handleLike(event.eventId)}>
              {event.liked ? (
                <FavoriteIcon style={{ color: 'red' }} /> // Liked state (red heart)
              ) : (
                <FavoriteBorderIcon /> // Not liked state (outline heart)
              )}
            </IconButton>
            {event.likes > 0 && (<Typography variant="body2">{event.likes}</Typography>)}
          </Box>
        </Box>
        <Typography variant="body1"><strong>Organizer:</strong>{event.organizer}</Typography>
        <Typography variant="body1"><strong>Date:</strong> {event.repeat ? `Every ${event.weekday} (${event.startdate} ~ ${event.enddate})`
          : event.startdate === event.enddate ?
            event.startdate
            : `${event.startdate} ~ ${event.enddate}`}<br /></Typography>
        <Typography variant="body1"><strong>Time:</strong> {event.startTime} ~ {event.endTime}</Typography>
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
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }} />
        {event.reserve && (event.isFull ? (<Typography variant="body1" color="error"><strong>Fully Reserved</strong></Typography>) : (
          <Button className='button' variant="contained" onClick={() => handleReserveClick(event)}>
            Reserve
          </Button>))}
        {/* Back button */}
      </Box>
      <ReservationDialog
        open={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        event={selectedEvent}
        normalUserDetail={normalUserDetail}
      />
    </div>
  );
};

export default EventDetail;
