import React, { useState, useEffect } from 'react';
import '../App.css';
import TopNavBar from '../components/TopNavBar';
import Pagination from '../components/Pagination';
import { Box, Button, Card, CardContent, CardActions, Typography, Grid, IconButton } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DOMPurify from 'dompurify';
function HomePage() {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const apiAppUrl = process.env.REACT_APP_API_FRONTEND_URL;
  const [events, setEvents] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [userName, setUserName] = useState('');
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');
  const [isLoggedIn, setIsLoggedIn] = useState(!!userEmail);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const open = Boolean(anchorEl);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (userRole === 'admin') {
          const response = await axios.get(`${apiBaseUrl}/api/admin-user-details/${userEmail}`);
          setUserName(response.data.adminName);
        } else {
          const response = await axios.get(`${apiBaseUrl}/api/normal-user-details/${userEmail}`);
          setUserName(response.data.name);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    if (userEmail && userRole) {
      fetchUserDetails();
    }
  }, [userEmail, userRole]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let eventsResponse;
        if (isLoggedIn) {
          eventsResponse = await axios.get(`${apiBaseUrl}/api/events`, {
            params: {
              userId: userId
            }
          });
        }
        else {
          eventsResponse = await axios.get(`${apiBaseUrl}/api/events`);
        }
        setEvents(eventsResponse.data);
        setFilteredData([...eventsResponse.data]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleNextImage = (eventId, images) => {
    setCurrentImageIndexes((prevIndexes) => {
      const newIndex = ((prevIndexes[eventId] || 0) + 1) % images.length;
      return { ...prevIndexes, [eventId]: newIndex };
    });
  };

  const handlePrevImage = (eventId, images) => {
    setCurrentImageIndexes((prevIndexes) => {
      const newIndex = ((prevIndexes[eventId] || 0) - 1 + images.length) % images.length;
      return { ...prevIndexes, [eventId]: newIndex };
    });
  };

  const getCurrentImageIndex = (eventId) => {
    return currentImageIndexes[eventId] || 0;
  };

  const handleShareEvent = (item) => {
    if (isLoggedIn) {
      if (navigator.share) {
        navigator
          .share({
            title: item.title,
            text: `Check out this event: ${item.title}`,
            url: `${apiAppUrl}/events/${item.eventId}`,
          })
          .then(() => console.log('Event shared successfully'))
          .catch((error) => console.error('Error sharing the event:', error));
      } else {
        const fallbackUrl = `${apiAppUrl}/events/${item.eventId}`;
        navigator.clipboard.writeText(fallbackUrl)
          .then(() => {
            alert('Browser does not support sharing, but the event URL has been copied to your clipboard.');
          })
          .catch((error) => {
            console.error('Error copying URL to clipboard:', error);
            alert('Web Share API is not supported in this browser. Unable to share the event.');
          });
      }
    }
    else {
      navigate('/login');
    }
  };

  const totalPages = Math.ceil(filteredData.length / eventsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleLike = async (eventId) => {
    if (isLoggedIn) {
      try {
        // Send a request to the backend to update the like count for the event
        const response = await axios.post(`${apiBaseUrl}/api/events/${eventId}/like`, { userId });

        // Update the local event state with the new like count
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.eventId === eventId
              ? { ...event, likes: response.data.likes, liked: response.data.liked } // update likes and liked state
              : event
          )
        );
        setFilteredData(events);
      } catch (error) {
        console.error('Error updating like:', error);
      }
    } else {
      navigate('/login');
    }
  };
  useEffect(() => {
    setFilteredData(events);
  }, [events]);
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredData.slice(indexOfFirstEvent, indexOfLastEvent);

  return (
    <div className="container">
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
      {/* Display filtered events */}
      <Grid container spacing={4} className="card-container">
        {currentEvents.length === 0 ? (
          <Typography variant="h6" align="center" className="no-events">
            No Events Available
          </Typography>
        ) : (
          currentEvents.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.eventId}>
              <Card
                className="event-card"
                onClick={() => {
                  if (item.link) {
                    // 如果 link 存在，则跳转到 link 对应的网页
                    window.open(item.link, '_blank');
                  } else {
                    // 如果 link 不存在，则跳转到 /events/${item.eventId}
                    navigate(`/events/${item.eventId}`);
                  }
                }}
              >
                <CardContent>
                  {item.images && item.images.length > 0 && (
                    <Box className="event-image-container">
                      <div style={{ width: '260px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img
                          src={`${item.images[getCurrentImageIndex(item.eventId)]}`}
                          alt={`Event Image ${getCurrentImageIndex(item.eventId) + 1}`}
                          className="event-image"
                        />
                      </div>
                      <Button
                        onClick={(e) => { e.stopPropagation(); handlePrevImage(item.eventId, item.images); }}
                        disabled={item.images.length <= 1}
                        className="arrow-button left-arrow"
                      >
                        &lt;
                      </Button>
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleNextImage(item.eventId, item.images); }}
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
                  {/*
                  <Typography variant="body2" className="event-info"> 
                    <strong>Organizer:</strong> {item.organizer}
                  </Typography> */}
                  <Typography variant="body2" className="event-info">
                    <strong>Date:</strong> {item.repeat ? `Every ${item.weekday}(${item.startdate} ~ ${item.enddate})` : item.startdate === item.enddate ? item.startdate : `${item.startdate} ~ ${item.enddate}`}<br />
                    <strong>Time:</strong> {item.startTime} ~ {item.endTime}
                  </Typography>
                  <Typography variant="body2" className="event-info">
                    <strong>Location:</strong>{' '}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'underline' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.location}
                    </a>
                  </Typography>
                  <Typography variant="body2" component="div" sx={{
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    <div dangerouslySetInnerHTML={{  __html: DOMPurify.sanitize(item.description.replace(/\n/g, '<br />')), }} />
                  </Typography>
                </CardContent>
                <CardActions className="card-actions">
                  <IconButton className="button" onClick={(e) => { e.stopPropagation(); handleShareEvent(item); }}>
                    <ShareIcon />
                  </IconButton>
                  <Typography variant="body2">Share</Typography>
                  <IconButton className="like-button" onClick={(e) => { e.stopPropagation(); handleLike(item.eventId); }}>
                    {item.liked ? (
                      <FavoriteIcon style={{ color: 'red' }} /> // Liked state (red heart)
                    ) : (
                      <FavoriteBorderIcon /> // Not liked state (outline heart)
                    )}
                  </IconButton>
                  {item.likes > 0 && (<Typography variant="body2">{item.likes}</Typography>)}
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Pagination */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
      />

    </div>
  );
}

export default HomePage;
