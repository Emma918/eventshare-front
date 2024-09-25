import React, { useState, useEffect } from 'react';
import '../App.css';
import TopNavBar from '../components/TopNavBar';
import { Box, Button, Card, CardContent, CardActions, Typography, Grid, IconButton } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ShareIcon from '@mui/icons-material/Share';

function HomePage() {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [events, setEvents] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [userName, setUserName] = useState('');
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  const [isLoggedIn, setIsLoggedIn] = useState(!!userEmail);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const open = Boolean(anchorEl);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9;

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
        const eventsResponse = await axios.get(`${apiBaseUrl}/api/events`);
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
    if (navigator.share) {
      navigator
        .share({
          title: item.title,
          text: `Check out this event: ${item.title}`,
          url: `${apiBaseUrl}/events/${item.eventId}`,
        })
        .then(() => console.log('Event shared successfully'))
        .catch((error) => console.error('Error sharing the event:', error));
    } else {
      alert('Web Share API is not supported in this browser.');
    }
  };

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
              <Card className="event-card">
                <CardContent>
                  {item.images && item.images.length > 0 && (
                    <Box className="event-image-container">
                      <div style={{ width: '260px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <img
                        src={`${apiBaseUrl}/${item.images[getCurrentImageIndex(item.eventId)].imagePath}`}
                        alt={`Event Image ${getCurrentImageIndex(item.eventId) + 1}`}
                        className="event-image"
                      />
                      </div>
                      <Button
                        onClick={() => handlePrevImage(item.eventId, item.images)}
                        disabled={item.images.length <= 1}
                        className="arrow-button left-arrow"
                      >
                        &lt;
                      </Button>
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
                    <strong>Organizer:</strong> {item.organizer}
                  </Typography>
                  <Typography variant="body2" className="event-info">
                    <strong>Date:</strong> {item.repeat ? `Every ${item.weekday}` : item.startdate === item.enddate ? item.startdate : `${item.startdate} ~ ${item.enddate}`}<br />
                    <strong>Time:</strong> {item.startTime}-{item.endTime}
                  </Typography>
                  <Typography variant="body2" className="event-info">
                    <strong>Location:</strong>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                      {item.location}
                    </a>
                  </Typography>
                  <Typography variant="body2" className="event-info">
                    <strong>Capacity:</strong> {item.capacity}
                  </Typography>
                </CardContent>
                <CardActions className="card-actions">
                  <Button variant="contained" component={Link} to={`/events/${item.eventId}`} className="button">
                    View Details
                  </Button>
                  <IconButton className="button" onClick={() => handleShareEvent(item)}>
                    <ShareIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
        <Button onClick={handlePrevPage} disabled={currentPage === 1}>
          &lt;
        </Button>
        {[...Array(totalPages).keys()].map((pageNumber) => (
          <Button className="button" key={pageNumber + 1} onClick={() => handlePageChange(pageNumber + 1)} variant={currentPage === pageNumber + 1 ? 'contained' : 'outlined'}>
            {pageNumber + 1}
          </Button>
        ))}
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
          &gt;
        </Button>
      </Box>
    </div>
  );
}

export default HomePage;
