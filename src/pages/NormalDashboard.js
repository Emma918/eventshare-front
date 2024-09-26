import React, { useState, useEffect ,useRef } from 'react';
import axios from 'axios';
import '../App.css'; 
import TopNavBar from '../components/TopNavBar';
import {TextField, Button, Box,Typography, Tabs, Tab, Card, CardContent, CardActions } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Grid from '@mui/material/Grid';
import ReservationDialog from './ReservationDialog';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
function NormalDashboard() {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [events, setEvents] = useState([]);
  const [orignevents, setOrignEvents] = useState([]);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [date, setDate] = useState(null);
  const [location, setLocation] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [reservedEvents, setReservedEvents] = useState([]);
  const [tabValue, setTabValue] = useState(0);  // 控制选项卡
  const [anchorEl, setAnchorEl] = useState(null);  // 控制菜单
  const open = Boolean(anchorEl);
  const [userName, setUserName] = useState('');  // 初始化 userName 为空字符串
  const userEmail = localStorage.getItem('userEmail');  //用户的邮箱
  const userRole= localStorage.getItem('userRole');  //用户角色
  const [isLoggedIn, setIsLoggedIn] = useState(!!userEmail);  // 检查是否已登录
  const [selectedEvent, setSelectedEvent] = useState(null); // 当前选中的课程ID
  const [normalUserDetail, setNormalUserDetail] = useState(null); // 存储用户详细信息
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [eventCategorys, setCategorys] = useState([]);//  get event categorys
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDate, setCurrentDate] = useState('');
  const inputRef = useRef(null);  // 创建 ref 引用
  const eventsPerPage = 5; 
  useEffect(() => {
    const checkIfEventsFull = async (events) => {
      const updatedEvents = await Promise.all(
        events.map(async (event) => {
         let isFull =false;
          if(!event.repeat && event.startdate===event.enddate){
          // 获取该event的预约人数
          const { data: reservationCount } = await axios.get(`${apiBaseUrl}/api/${event.eventId}/reservnum?date=${event.startdate}`);
          // 判断是否预约满了
          isFull = reservationCount >= event.capacity;
          console.log(isFull);
        } 
          // 返回一个新的事件对象，添加了是否已满的标记
          return {
            ...event,
            isFull, // 添加 `isFull` 字段来表示是否预约满了
          };
        })
      );
    
      // 更新 events 列表，包含是否已满的信息
      return updatedEvents; // Return the updated events
    };
    const fetchEvents = async () => {
      const response = await axios.get(`${apiBaseUrl}/api/events`);
      if(response.length !==0){
        const eventsData = response.data;
        const updatedEvents = await checkIfEventsFull(eventsData);
        setEvents(updatedEvents);
        setOrignEvents(updatedEvents);
        setFilteredEvents(updatedEvents); 
    }
    };
    fetchEvents();
     //get category
     const getCategory = async () => {
      const response = await axios.get(`${apiBaseUrl}/api/columns/Event category`);
      if(response.length !==0){
        setCategorys(response.data); 
    }
    };
    getCategory();
    const date = new Date();  // 获取当前日期
    const formattedDate = date.toLocaleDateString();  // 格式化日期
    setCurrentDate(formattedDate);  // 设置格式化的日期
  }, [apiBaseUrl]);
  
  
// 获取用户详细信息
   useEffect(() => {
     const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/normal-user-details/${userEmail}`);
      if(response.length !==0){
      setNormalUserDetail(response.data);  // 将用户详细信息存储在状态中
      setUserName(response.data.name);  // 获取用户的 name 并赋值给 userName
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
    };

  if (userEmail) {
    fetchUserDetails();  // 如果用户邮箱存在，则获取详细信息
  }
  }, [userEmail,normalUserDetail,apiBaseUrl]);
useEffect(() => {
  const fetchReservedEvents = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/user/reserved-events/${userEmail}`);
      if(response.length !==0){
      setReservedEvents(response.data);  // 保存预约课程信息
    }
    } catch (error) {
      console.error('Error fetching reserved events:', error);
    }
  };

  if (userEmail) {
    fetchReservedEvents();
  }
}, [userEmail,apiBaseUrl]);
 // Fetch reserved events
const refreshReservedEvents = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/api/user/reserved-events/${userEmail}`);
    if(response.length !==0){
    setReservedEvents(response.data);
  }
  } catch (error) {
    console.error('Error fetching reserved events:', error);
  }
};

const filterEvents = () => {
    let uniqueEvents = events;
    let filteredByDate  = events;
    let filteredByWeekday = events;
    if (date) {
      filteredByDate = filteredByDate.filter(event => {
        const eventStartDate = new Date(event.startdate);
        const eventEndDate = new Date(event.enddate);
        const inputDate = new Date(date);
      
        return inputDate >= eventStartDate && inputDate <= eventEndDate && !event.repeat;
      });      
      const inputdate = new Date(date);  // 将日期字符串转换为 Date 对象
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayIndex = inputdate.getDay(); 
      filteredByWeekday = filteredByWeekday.filter(event => event.weekday === daysOfWeek[dayIndex]);
      const combinedFilteredEvents = [
      ...filteredByDate,
      ...filteredByWeekday
    ];
    uniqueEvents = Array.from(new Set(combinedFilteredEvents.map(event => event.eventId)))
  .map(id => combinedFilteredEvents.find(event => event.eventId === id));
    }
    if (location) {
      uniqueEvents = uniqueEvents.filter(event => event.location.toLowerCase().includes(location.toLowerCase()));
    }
    setFilteredEvents(uniqueEvents);
  };
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);  // 切换选项卡
  };
  const filterEventsByCategory = (e) => {
    setDate(null);
    setLocation(null);
    let uniqueEvents = orignevents;
    const categoryValue = Number(e.currentTarget.value);
    uniqueEvents = uniqueEvents.filter(event => event.category === categoryValue);
    setEvents(uniqueEvents);
    setFilteredEvents(uniqueEvents);
  };
// 点击课程卡片进行预约
const handleReserveClick = (event) => {
  if(isLoggedIn){
    setSelectedEvent(event); // 设置选中的课程
    setIsReservationOpen(true); // 打开预约窗口
    console.log('Selected event:', event)
  }else{
  alert("Please login first!");
}
};
 // 取消预约
 const handleCancelReservation = async (eventId, date) => {
  try {
    await axios.delete(`${apiBaseUrl}/api/events/reserve/${eventId}`, {
      data: {
        email: userEmail,
      }
    });
    alert('Reservation cancelled successfully!');
    
    // 重新获取预约的课程信息
    setReservedEvents(reservedEvents.filter(event => event.event.eventId !== eventId));
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    alert('Failed to cancel reservation. Please try again.');
  }
};
// Pagination handlers
const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

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

useEffect(() => {
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  setCurrentEvents(filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent));
}, [filteredEvents, currentPage]);


  const handleKeyDown = (event) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      setDate(null);  // 清空日期
    }
  };
  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.select();  // 全选日期
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
      <Box sx={{ display: 'flex', gap: 0.5, mt: 2 }}>
      {eventCategorys && eventCategorys.map((categorys, index) => (
      <Button key={index} value={categorys.columnSeq} color="inherit" className="category-button" onClick={(e) => filterEventsByCategory(e)}>
      {categorys.columnDetail}
      </Button>
      ))} </Box>
    {/* 日期选择和地点输入 */}
    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Select Date"
          value={date}
          onChange={(newValue) => setDate(newValue)}
          renderInput={(params) => <TextField {...params}  
          inputRef={inputRef}  // 绑定 inputRef
          onKeyDown={handleKeyDown}  // 监听删除键
          onFocus={handleFocus}             
        />}
        />
      </LocalizationProvider>
      <TextField
        label="Search by Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <Button variant="contained" className="button" onClick={filterEvents}>Search</Button>
    </Box>
  
    {/* 分页组件 */}
    <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
        <Tab label="Available Events" />
        {isLoggedIn && (
           <Tab label="Reserved Events" />)}
      </Tabs>

      {/* 可用课程分页 */}
      {tabValue === 0 && (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {currentEvents.length === 0 ? (
              <Typography>No Events Available!</Typography>
            ) : (
              currentEvents.map(event => (
                <Grid item xs={12} key={event.eventId}>
                  <Card sx={{ mb: 3,width: '90%' }} className="event-card">
                  <Link to={`/events/${event.eventId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      {/* Left side: Event details */}
                      <Grid item xs={6}>
                        <Typography variant="h6">{event.title}</Typography>
                        <Typography variant="body2"> 
                          {event.organizer}<br />
                          Date: {event.repeat ?`Every ${event.weekday}` : event.startdate===event.enddate?event.startdate:`${event.startdate} ~ ${event.enddate}`}  <br />
                          Time:{event.startTime} -- {event.endTime} <br />
                          Location: {event.location} <br />
                          Capacity: {event.capacity} <br />
                          Level: {event.levelname} <br />
                          Free: {event.isFree ? 'Yes' : 'No'} <br />
                          {event.reserve ? 'Reservation Required' : 'No Reservation Required'} <br />
                          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }}/> <br />
                          </Typography>
                      </Grid>
                      {/* Right side: Event image */}
                      <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         {event.images && event.images.length > 0 && (
                           <div style={{ width: '200px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                           <img
                            src={`${event.images[0].imagePath}`}
                            alt="Event"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                           />
                           </div>
                          )}
                      </Grid>
                    </Grid>
                    </CardContent>
                    </Link>
                    <CardActions>
                    {event.reserve && (event.isFull ? ( <Typography variant="body1" color="error">Fully Reserved</Typography>) : (
                      <Button variant="outlined" onClick={() => handleReserveClick(event)}>
                       Reserve
                      </Button> ))}
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
        </Box> 
      )}

      {/* 已预约课程分页 */}
      {isLoggedIn && tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {reservedEvents.length === 0 ? (
              <Typography>No reserved events found.</Typography>
            ) : (
              reservedEvents.map(event => (
                <Grid item xs={12} key={event.eventId}>
                  <Card sx={{ mb: 2,width: '90%' }} className="event-card">
                    <CardContent>
                      <Typography variant="h6">{event.event.title}</Typography>
                      <Typography variant="body2">
                        Organizer: {event.event.organizer}<br />
                        Date: {event.reservationDetails.date}  {event.event.startTime}--{event.event.endTime}<br />
                        Location: {event.event.location}<br />
                      </Typography>
                    </CardContent>
                    <CardActions>
                    { new Date(event.reservationDetails.date)>=new Date(currentDate) && (<Button variant="outlined" color="secondary" onClick={() => handleCancelReservation(event.event.eventId, event.reservationDetails.date)}>
                        Cancel
                      </Button>)
                      }
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}
    <ReservationDialog
        open={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        event={selectedEvent}
        normalUserDetail={normalUserDetail}
        refreshReservedEvents={refreshReservedEvents} 
      />
  </div>
  
  );
}

export default NormalDashboard;
