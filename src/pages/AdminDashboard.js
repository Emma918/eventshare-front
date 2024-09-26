import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css'; 
import TopNavBar from '../components/TopNavBar';
import { TextField,Box, Button, IconButton,Typography,  Dialog, Card, CardContent, DialogActions, DialogContent,Grid } from '@mui/material';
import { CopyAll, Delete, Edit, FileDownload} from '@mui/icons-material';
import ShareIcon from '@mui/icons-material/Share';
import { saveAs } from 'file-saver';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddEditEventDialog from './AddEditEventDialog';  // 新增活动对话框
import ExportDialog from './ExportDialog'; 
function AdminDashboard() {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [date, setDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const userEmail = localStorage.getItem('userEmail');  //用户的邮箱
  const userRole= localStorage.getItem('userRole');  //用户角色
  const [userName, setUserName] = useState('');  // 初始化 userName 为空字符串
  const [userAddress, setUserAddress] = useState('');  // 初始化 userAddress 为空字符串
  const [isLoggedIn, setIsLoggedIn] = useState(!!userEmail);  // 检查是否已登录
  const [adminUserDetail, setAdminUserDetail] = useState(null); // 存储用户详细信息
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5; 
  const [newEvent, setNewEvent] = useState({
    category:'',
    title: '',
    startdate: '',
    enddate: '',
    startTime: '',
    endTime: '',
    organizer: '',
    location: '',
    capacity: 0,
    level: '',
    isFree: false,
    reserve: false,
    repeat: false,
    description: '',
  });
  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiBaseUrl}/api/events/email/${userEmail}`, { headers: { Authorization: `Bearer ${token}` } });
      setEvents(response.data);
      setFilteredEvents(response.data);  // 默认显示所有活动
    };
    fetchEvents();
  }, [apiBaseUrl,userEmail]);
// 获取用户详细信息
useEffect(() => {
  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/admin-user-details/${userEmail}`);
      setAdminUserDetail(response.data);  // 将用户详细信息存储在状态中
      setUserName(response.data.adminName);  // 获取用户的 name 并赋值给 userName
      setUserAddress(response.data.address);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  if (userEmail) {
    fetchUserDetails();  // 如果用户邮箱存在，则获取详细信息
  }
}, [apiBaseUrl,userEmail,adminUserDetail]);

// 根据日期过滤活动
const filterEvents = () => {
  let filteredByDate  = events;
  let filteredByWeekday = events;
  let uniqueEvents = events;
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
  setFilteredEvents(uniqueEvents);
};
const refreshEvents = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${apiBaseUrl}/api/events/${userEmail}`, { headers: { Authorization: `Bearer ${token}` } });
    setEvents(response.data);
    setFilteredEvents(response.data);  // 默认显示所有活动
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};
  // 打开新增活动对话框
const handleAddEventOpen = () => {
    setNewEvent({
      category:'',
      email:userEmail,
      title: '',
      startdate: '',
      enddate: '',
      startTime: '',
      endTime: '',
      organizer: userName,
      location: userAddress,
      capacity: 0,
      level: '',
      isFree: false,
      reserve: false,
      repeat: false,
      description: '',
    });
    setOpenAdd(true);
  };
    // 提交新增活动
 const handleAddEventSubmit = async (formData) => {
      try {
        console.log('newEvent:', formData); // Check what is being sent to the backend
        const response = await axios.post(`${apiBaseUrl}/api/events`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Set the correct headers for file upload
          }
        });
        
        setEvents([...events, response.data]);
        setOpenAdd(false);
        alert("New event has been added");
        refreshEvents();
      } catch (error) {
        console.error("Error adding event:", error);
      }
};

  // 打开编辑活动对话框并填充活动信息
  const handleEditEventOpen = (event) => {
    setNewEvent({
      eventId:event.eventId,
      title: event.title,
      startdate: event.startdate || '',  // 日期
      enddate: event.enddate || '',  // 日期
      startTime: event.startTime || '',  // 开始时间
      endTime: event.endTime || '',  // 结束时间
      location: event.location,
      capacity: event.capacity,
      level: event.level,
      isFree: event.isFree,
      reserve:event.reserve,
      repeat: event.repeat || false,  // 是否每周重复
      description: event.description,
      category: event.category,
      images: event.images,
      organizer: event.organizer,
    });
    setSelectedEvent(event);
    setOpenEdit(true);
  };

  // 提交更新的活动信息
  const handleEditEventSubmit = async (formData) => {
    try {
      await axios.put(`${apiBaseUrl}/api/events/${selectedEvent.eventId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set the correct headers for file upload
        }
      });
      const updatedEvents = events.map((event) =>
        event.eventId === selectedEvent.eventId ? { ...event, ...formData } : event
      );
      setEvents(updatedEvents);
      setOpenEdit(false);
      alert("The event has been updated");
      refreshEvents();
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  // 打开删除确认对话框
  const handleDeleteEventOpen = (event) => {
    setSelectedEvent(event);
    setOpenConfirmDelete(true);
  };

  // 关闭删除确认对话框
  const handleDeleteEventClose = () => {
    setOpenConfirmDelete(false);
  };
  // 删除活动
  const handleDeleteEvent = async () => {
    try {
      console.log(selectedEvent.eventId);
      await axios.delete(`${apiBaseUrl}/api/events/${selectedEvent.eventId}`);
      setEvents(events.filter((event) => event.eventId !== selectedEvent.eventId));
      setOpenConfirmDelete(false);
      alert("The event has been deleted.");
      refreshEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
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

  // 复制活动信息到新建活动
  const handleCopyEvent = (event) => {
    setNewEvent({
      title: event.title,//标题
      email:userEmail,
      startdate: event.startdate || '',  // 开始日期
      enddate: event.enddate || '',  // 结束日期
      startTime: event.startTime || '',  // 开始时间
      endTime: event.endTime || '',  // 结束时间
      location: event.location,//位置
      capacity: event.capacity,//容量
      level: event.level,//等级
      isFree: event.isFree,//是否免费
      reserve: event.reserve,
      repeat: event.repeat || false,  // 是否每周重复
      description: event.description ,
      organizer: event.organizer,
      category: event.category,
    });
    setOpenAdd(true);
  };
  // 导出预约信息
  const handleExportReservations = async (eventId,repeat,weekday) => {
    try {
      setSelectedEventId(eventId);
      if (repeat) {
        try {
          const response = await axios.get(`${apiBaseUrl}/api/${eventId}/weekdays?weekday=${weekday}`);
          setAvailableDates(response.data);
          setOpenExportDialog(true); // Open the export dialog
        } catch (error) {
          console.error('Error fetching available dates:', error);
        }
      } else {
    const response = await axios.get(`${apiBaseUrl}/api/events/${eventId}/reservations`);
    const reservations = response.data;

    if (reservations.length === 0) {
      alert('No reservations found for this event.');
      return;
    }

    // 将 JSON 数据转换为 CSV 格式
    let csvContent = "Name,Gender,Phone,Email,Nationality,First Language\n"; // 表头

    reservations.forEach(reservation => {
      const row = `${reservation.name},${reservation.gender},${reservation.phone},${reservation.email},${reservation.nationality},${reservation.firstLanguage}\n`;
      csvContent += row;
    });

    // 创建 Blob 对象
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'reservations.csv'); // 使用 file-saver 导出为 .csv 文件
  }
  } catch (error) {
    console.error('Error exporting reservations:', error);
    alert('Failed to export reservations. Please try again.');
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

// Get current events for the page
const indexOfLastEvent = currentPage * eventsPerPage;
const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
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
       {/* 日期选择*/}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 ,mt : 4  }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Select Date"
          value={date}
          onChange={(newValue) => setDate(newValue)}
          renderInput={(params) => <TextField {...params} />}
        />
      </LocalizationProvider>
      <Button variant="contained" className="button" onClick={filterEvents}>Search</Button>
      {/* 新增活动按钮 */}
      <Button variant="contained"className="button" onClick={handleAddEventOpen}>Add New Event</Button>
    </Box>
      {/* 活动卡片 */}
      {currentEvents.length === 0 ? (
        <Typography>No Events Available</Typography>
      ) : (
        currentEvents.map((event) => (
        <Card key={event.eventId} sx={{ mb: 3,width: '90%' }}  className="event-card">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{event.title}</Typography>
              <Box>
                <IconButton onClick={() => handleShareEvent(event)}><ShareIcon /></IconButton>
                <IconButton onClick={() => handleEditEventOpen(event)}><Edit /></IconButton>
                <IconButton onClick={() => handleCopyEvent(event)}><CopyAll /></IconButton>
                <IconButton onClick={() => handleDeleteEventOpen(event)}><Delete /></IconButton>
              </Box>
            </Box>
            <Grid container spacing={2}>
            <Grid item xs={6}>
            <Typography sx={{ color: 'gray' }}> {event.organizer}</Typography>
            {/* 静态显示详细信息 */}
            <Typography><strong>Date:</strong> {event.repeat ?`Every ${event.weekday}` : event.startdate===event.enddate?event.startdate:`${event.startdate} ~ ${event.enddate}`}</Typography>
            <Typography><strong>Time:</strong> {event.startTime} -- {event.endTime}</Typography>
            <Typography><strong>Location:</strong> {event.location}</Typography>
            <Typography><strong>Capacity:</strong> {event.capacity}</Typography>
            <Typography><strong>Level:</strong> {event.levelname}</Typography>
            <Typography><strong>Free Event:</strong> {event.isFree ? 'Yes' : 'No'}</Typography> 
            <Typography><strong>Reservation:</strong> {event.reserve ? 'Reservation Required' : 'No Reservation Required'}</Typography>           
            </Grid>
            <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {event.images && event.images.length > 0 && (
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img
                   src={`${event.images[0].imagePath}`}
                   alt="Event"
                    style={{ width: '100%', height: 'auto', maxHeight: '150px', objectFit: 'contain' }}
                  />
                  </div>)}
              </Grid>
            </Grid>
            {/*导出预约信息按钮 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="outlined" onClick={() => handleExportReservations(event.eventId,event.repeat,event.weekday)}><FileDownload /> Export Reservations</Button>
            </Box>
          </CardContent>
        </Card>
      )))}
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
      {/* 新增或编辑活动窗口 */}
      <AddEditEventDialog
        open={openAdd || openEdit}
        onClose={() => {
          setOpenAdd(false);
          setOpenEdit(false);}}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        handleEventSubmit={openEdit ? handleEditEventSubmit : handleAddEventSubmit}
        isEdit={openEdit}
        />
      {/* 删除确认对话框 */}
      <Dialog open={openConfirmDelete} onClose={handleDeleteEventClose}>
        <DialogContent>
          <Typography>Are you sure you want to delete this event?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteEventClose}>Cancel</Button>
          <Button onClick={handleDeleteEvent} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      <ExportDialog
        open={openExportDialog}
        onClose={() => setOpenExportDialog(false)}
        eventId={selectedEventId}
        availableDates={availableDates}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      
    </div>
  );
}

export default AdminDashboard;
