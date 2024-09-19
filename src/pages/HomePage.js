import React, { useState, useEffect } from 'react';
import '../App.css';
import TopNavBar from '../components/TopNavBar';
import { Box,Button,Card,CardContent,CardActions, Typography, Grid,IconButton} from '@mui/material';
import axios from 'axios';
import ChangePasswordDialog from './ChangePasswordDialog';
import EditProfileDialog from './EditProfileDialog';
import {handleMenuClose, handleChangePasswordClose, handleEditProfileClose} from './menuUtils';
import { Link } from 'react-router-dom';
import ShareIcon from '@mui/icons-material/Share';
function HomePage() {
  const [events, setEvents] = useState([]);  // 存储英语课程
  const [filteredData, setFilteredData] = useState([]);  // 存储过滤后的数据
  const [userName, setUserName] = useState('');  // 初始化 userName 为空字符串
  const userEmail = localStorage.getItem('userEmail');  //用户的邮箱
  const userRole= localStorage.getItem('userRole');  //用户角色
  const [isLoggedIn, setIsLoggedIn] = useState(!!userEmail);  // 检查是否已登录
  const [anchorEl, setAnchorEl] = useState(null);  // 控制菜单
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({}); // Track the currently displayed image
  const open = Boolean(anchorEl);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9; 
  useEffect(() => {
    const fetchUserDetails = async () => {
   try {
    if (userRole === 'admin') {
     const response = await axios.get(`http://localhost:5000/api/admin-user-details/${userEmail}`);
     setUserName(response.data.adminName);
    } else {
      const response = await axios.get(`http://localhost:5000/api/normal-user-details/${userEmail}`);
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
    // 获取课程和活动数据
    const fetchData = async () => {
      try {
        const eventsResponse = await axios.get('http://localhost:5000/api/events');
        setEvents(eventsResponse.data);
        setFilteredData([...eventsResponse.data]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
    // Handle moving to the next image
    const handleNextImage = (eventId, images) => {
      setCurrentImageIndexes((prevIndexes) => {
        const newIndex = ((prevIndexes[eventId] || 0) + 1) % images.length;
        return {
          ...prevIndexes,
          [eventId]: newIndex,
        };
      });
    };
  
    // Handle moving to the previous image
    const handlePrevImage = (eventId, images) => {
      setCurrentImageIndexes((prevIndexes) => {
        const newIndex = ((prevIndexes[eventId] || 0) - 1 + images.length) % images.length;
        return {
          ...prevIndexes,
          [eventId]: newIndex,
        };
      });
    };
    // Helper function to get the current image index for a specific event
    const getCurrentImageIndex = (eventId) => {
      return currentImageIndexes[eventId] || 0;
    };
    const handleShareEvent = (item) => {
      if (navigator.share) {
        navigator
          .share({
            title: item.title,
            text: `Check out this event: ${item.title}`,
            url: `http://localhost:3000/events/${item.eventId}`,
          })
          .then(() => console.log('Event shared successfully'))
          .catch((error) => console.error('Error sharing the event:', error));
      } else {
        alert('Web Share API is not supported in this browser.');
      }
    };
  // Pagination handlers
  const totalPages = Math.ceil(filteredData.length / eventsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Get current events for the page
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredData.slice(indexOfFirstEvent, indexOfLastEvent);
  return (
    <div className="container">
       {/* 顶端任务栏 */}
       <TopNavBar
        isLoggedIn={isLoggedIn}
        userName={userName}
        anchorEl={anchorEl}
        open={open}
        handleEventsOpen={() => {
          try {
          if (userRole === 'admin') {
            window.location.href = '/admin-dashboard';
          } else {
            window.location.href = '/normal-dashboard';
          } } catch (error) {
            console.error(error);
          }}}
        handleMenuOpen={(e) => setAnchorEl(e.currentTarget)}
        handleMenuClose={() => setAnchorEl(null)}
        handleLogout={() => {
          setIsLoggedIn(false);
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          window.location.href = '/login';
        }}
        setIsChangePasswordOpen={setIsChangePasswordOpen}
        setIsEditProfileOpen={setIsEditProfileOpen}
       />
      {/* 显示过滤后的课程和活动 */}
      <Grid container spacing={4} className="card-container">
  {currentEvents.length === 0 ? (
    <Typography variant="h6" align="center" className="no-events">
      No Events Available
    </Typography>
  ) : (
    currentEvents.map((item) => (
      <Grid item xs={12} sm={6} md={4} key={item.eventId}>
        <Card className="event-card">
          <CardContent>
          {item.images && item.images.length > 0 && (
            <Box className="event-image-container">
            {/* Display the current image */}
            <img
               src={`http://localhost:5000/${item.images[getCurrentImageIndex(item.eventId)].imagePath}`}
               alt={`Event Image ${getCurrentImageIndex(item.eventId) + 1}`}
               className="event-image"
             />         
            {/* Left Arrow Button */}
            <Button
              onClick={() => handlePrevImage(item.eventId, item.images)}
              disabled={item.images.length <= 1}
              className="arrow-button left-arrow"
            >
              &lt;
            </Button>
          
            {/* Right Arrow Button */}
            <Button
              onClick={() => handleNextImage(item.eventId, item.images)}
              disabled={item.images.length <= 1}
              className="arrow-button right-arrow"
            >
              &gt;
            </Button>
          </Box>
      )}
            <Typography variant="h5" className="event-title">
              {item.title}
            </Typography>
            <Typography variant="body2" className="event-info">
             <strong>Organizer:</strong>  {item.organizer}
            </Typography>
            <Typography variant="body2" className="event-info">
              <strong>Date:</strong> {item.repeat ?`Every ${item.weekday}` 
              : item.startdate===item.enddate?
              item.startdate
              :`${item.startdate} ~ ${item.enddate}`}<br/>
              <strong>Time:</strong>{item.startTime}-{item.endTime}
            </Typography>
            <Typography variant="body2" className="event-info">
              <strong>Location:</strong>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                 target="_blank" 
                 rel="noopener noreferrer"
                 style={{textDecoration: 'underline' }}> {item.location}</a>
            </Typography>
            <Typography variant="body2" className="event-info">
              <strong>Capacity:</strong> {item.capacity}
            </Typography>
          </CardContent>
          <CardActions className="card-actions">
            <Button variant="contained" component={Link} to={`/events/${item.eventId}`}className="button">
              View Details
            </Button>
            <IconButton className="button"onClick={() => handleShareEvent(item)}>
              <ShareIcon />
          </IconButton>
          </CardActions>
        </Card>
      </Grid>
    ))
  )}
</Grid>
   {/* Pagination */}
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2,gap: 2 }}>
        <Button onClick={handlePrevPage} disabled={currentPage === 1}>
          &lt;
        </Button>
        {[...Array(totalPages).keys()].map((pageNumber) => (
          <Button className='button'
            key={pageNumber + 1}
            onClick={() => handlePageChange(pageNumber + 1)}
            variant={currentPage === pageNumber + 1 ? 'contained' : 'outlined'}
          >
            {pageNumber + 1}
          </Button>
        ))}
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
          &gt;
        </Button>
      </Box>
   <ChangePasswordDialog
        open={isChangePasswordOpen}
        onClose={handleChangePasswordClose(setIsChangePasswordOpen, handleMenuClose(setAnchorEl))}
        userEmail={userEmail}
      />

      <EditProfileDialog
        open={isEditProfileOpen}
        onClose={handleEditProfileClose(setIsEditProfileOpen, handleMenuClose(setAnchorEl))}
        userEmail={userEmail}
        role={userRole}
      />
  </div>
  );
}

export default HomePage;
