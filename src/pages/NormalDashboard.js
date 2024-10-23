import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../App.css';
import TopNavBar from '../components/TopNavBar';
import Pagination from '../components/Pagination';
import { IconButton, TextField, Button, Box, Typography, Card, CardContent, CardActions, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Grid from '@mui/material/Grid';
import ReservationDialog from './ReservationDialog';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import moment from 'moment-timezone'; // Import moment-timezone
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import MenuIcon from '@mui/icons-material/Menu'; // 引入 Menu 图标
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // 引入样式
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
// 设置本地时间
const localizer = momentLocalizer(moment);
// 生成从 startdate 到 enddate 的每一天
const getDateRange = (start, end) => {
  const dateArray = [];
  let currentDate = new Date(start); // 仍然保持为 Date 对象
  const today = new Date(); // 获取当前日期
  const endDate = new Date(end); // 保持为 Date 对象

  // 清除时间部分，仅保留日期进行比较
  currentDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  // 如果 startdate 小于当前日期，则从当前日期开始
  if (currentDate < today) {
    currentDate = today;
  }
  // 生成从 currentDate 到 endDate 的所有日期
  while (currentDate <= endDate) {
    dateArray.push(new Date(currentDate)); // 将每一天添加到数组中
    currentDate.setDate(currentDate.getDate() + 1); // 前进到下一天
  }
  return dateArray;
};

// 获取从 start 到 end 之间的所有符合 weekday 的日期
const getDateRangeByWeekday = (start, end, weekday) => {
  const dateArray = [];
  let currentDate = new Date(start); // 保持为 Date 对象
  const today = new Date(); // 获取当前日期
  const endDate = new Date(end); // 保持为 Date 对象

  // 清除时间部分，仅保留日期进行比较
  currentDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  // 如果 startdate 小于当前日期，则从当前日期开始
  if (currentDate < today) {
    currentDate = today;
  }

  // 转换 weekday 为对应的数字（0=Sunday, 1=Monday, ..., 6=Saturday）
  const targetWeekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(weekday);

  // 循环遍历日期范围，找到所有符合 weekday 的日期
  while (currentDate <= endDate) {
    if (currentDate.getDay() === targetWeekday) {
      dateArray.push(new Date(currentDate)); // 只添加符合 weekday 的日期
    }
    currentDate.setDate(currentDate.getDate() + 1); // 前进到下一天
  }

  return dateArray;
};
// 自定义事件列表的渲染方式
function CustomEvent({ event }) {
  // 自定义事件列表的样式和内容
  return (
    <div className="custom-event-card" style={{ display: 'flex', alignItems: 'center' }}>
      {/* 图片部分 */}
      {event.images && event.images.length > 0 && (
        <div style={{ marginRight: '30px' }}> {/* 图片和内容之间的间距 */}
          <img
            src={`${event.images[0]}`}
            alt="Event"
            style={{ width: '100px', height: '100px', objectFit: 'contain' }} // 设置图片尺寸
          />
        </div>
      )}

      {/* 内容部分：标题、时间、地点 */}
      <div>
        <strong>{event.title}</strong>
        {event.liked && (
          <FavoriteIcon style={{ color: 'red', marginLeft: '10px' }} />  // 显示红心
        )}
        <p>{event.time}</p>
        <p>{event.location}</p>
      </div>
    </div>
  );
}
function CustomEventForWeek({ event }) {
  // 自定义事件列表的样式和内容
  return (
    <div className="custom-event-card" style={{ display: 'flex', alignItems: 'center' }}>
      {/* 内容部分：标题、时间、地点 */}
      <div>
        <strong>{event.title}</strong>
        {event.liked && (
          <FavoriteIcon style={{ color: 'red', marginLeft: '10px' }} />  // 显示红心
        )}
        <p>{event.time}</p>
        <p>{event.location}</p>
      </div>
    </div>
  );
}
function NormalDashboard() {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const apiAppUrl = process.env.REACT_APP_API_FRONTEND_URL;
  const [loading, setLoading] = useState(true);  // Add loading state
  const [events, setEvents] = useState([]);
  const [showAll, setShowAll] = useState(false); // 控制是否显示全部类别
  const [orignevents, setOrignEvents] = useState([]);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [date, setDate] = useState(null);
  const [location, setLocation] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);  // 控制菜单
  const open = Boolean(anchorEl);
  const [userName, setUserName] = useState('');  // 初始化 userName 为空字符串
  const userEmail = localStorage.getItem('userEmail');  //用户的邮箱
  const userRole = localStorage.getItem('userRole');  //用户角色
  const userId = localStorage.getItem('userId');
  const [isLoggedIn, setIsLoggedIn] = useState(!!userEmail);  // 检查是否已登录
  const [selectedEvent, setSelectedEvent] = useState(null); // 当前选中的课程ID
  const [normalUserDetail, setNormalUserDetail] = useState(null); // 存储用户详细信息
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [eventCategorys, setCategorys] = useState([]);//  get event categorys
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDate, setCurrentDate] = useState('');
  const [hoveredDate, setHoveredDate] = useState(null); // 追踪鼠标悬停的日期
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const inputRef = useRef(null);  // 创建 ref 引用
  const eventsPerPage = 9;
  const navigate = useNavigate();

  // 获取传回的 viewMode，仅当从 EventDetail 返回时处理
  const [viewMode, setViewMode] = useState(useLocation().state?.viewMode || 'list');// 用于页面跳转
  // 新增状态来控制显示模式：列表或日历
  const [view, setView] = useState(Views.WEEK); // 默认为 week 视图
  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // 将活动数据转换为日历事件格式
  const eventListForCalendar = filteredEvents.flatMap(event => {
    let dates;
    if (event.dates) {
      dates = event.dates;
    }
    else {
      dates = event.repeat
        ? getDateRangeByWeekday(event.startdate, event.enddate, event.weekday) // 处理重复的事件
        : getDateRange(event.startdate, event.enddate); // 非重复事件
    }
    // 再次过滤，只保留与用户选择的日期匹配的日期
    if (date) {
      const inputDate = new Date(date);
      inputDate.setHours(0, 0, 0, 0); // 只保留日期部分
      const validDates = dates.filter(d => {
        const eventDate = new Date(d);
        eventDate.setHours(0, 0, 0, 0); // 只保留日期部分
        return eventDate.getTime() === inputDate.getTime();
      });
      dates = validDates;
    }
    return dates.map(date => {
      // 创建一个新的 Date 对象来确保时间和日期都被正确设置
      const localDate = new Date(date); // 确保 date 是你要的日期
      const [hours, minutes] = event.startTime.split(':'); // 分割小时和分钟

      // 设置时间
      localDate.setHours(parseInt(hours), parseInt(minutes), 0, 0); // 设置正确的小时和分钟

      const startTime = new Date(localDate); // 创建最终的 startTime
      const endTime = new Date(localDate); // 同样的方法用于 endTime

      // 使用同样的方式设置 endTime
      const [endHours, endMinutes] = event.endTime.split(':');
      endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

      return {
        title: event.title,
        start: startTime,
        end: endTime,
        location: event.location,
        eventId: event.eventId,
        allDay: view === 'week' || view === 'day', // Treat as all-day event in week/day view
        images: event.images,
        time: `${event.startTime} ~ ${event.endTime}`,
        liked: event.liked,
        link: event.link,
      };
    });
  });
  // 当点击日历中的某个事件时，跳转到 EventDetail 页面
  const handleSelectEvent = (event) => {
    if (event.link) {
      // 如果 link 存在，则跳转到 link 对应的网页
      window.open(event.link, '_blank');
    } else {
      // 如果 link 不存在，则跳转到 /events/${event.eventId}
      navigate(`/events/${event.eventId}`, { state: { viewMode: viewMode, from: 'NormalDashboard' } }); // 跳转到 eventId 对应的 EventDetail 页面
    }

  };
  useEffect(() => {
    const checkIfEventsFull = async (events) => {
      const updatedEvents = await Promise.all(
        events.map(async (event) => {
          let isFull = false;
          if (!event.repeat && event.startdate === event.enddate) {
            // 获取该event的预约人数
            const { data: reservationCount } = await axios.get(`${apiBaseUrl}/api/${event.eventId}/reservnum?date=${event.startdate}`);
            // 判断是否预约满了
            isFull = reservationCount >= event.capacity;
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
      try {
        let response;
        if (isLoggedIn) {
          response = await axios.get(`${apiBaseUrl}/api/events`, {
            params: {
              userId: userId,
            },
          });
        }
        else {
          response = await axios.get(`${apiBaseUrl}/api/events`);
        }
        if (response.length !== 0) {
          const eventsData = response.data;
          const updatedEvents = await checkIfEventsFull(eventsData);
          setEvents(updatedEvents);
          setOrignEvents(updatedEvents);
          setFilteredEvents(updatedEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false); // Ensure loading is false after fetching and processing data
      }
    };
    fetchEvents();
    //get category
    const getCategory = async () => {
      const response = await axios.get(`${apiBaseUrl}/api/columns/Event category`);
      if (response.length !== 0) {
        setCategorys(response.data);
      }
    };
    getCategory();
    const date = new Date();  // 获取当前日期
    const formattedDate = date.toLocaleDateString();  // 格式化日期
    setCurrentDate(formattedDate);  // 设置格式化的日期
  }, [apiBaseUrl]);
  const chunkCategories = (categories, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < categories.length; i += chunkSize) {
      chunks.push(categories.slice(i, i + chunkSize));
    }
    return chunks;
  };

  // 只显示前6个或全部类别
  const visibleCategories = showAll ? eventCategorys : eventCategorys.slice(0, 6);

  // 获取用户详细信息
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/normal-user-details/${userEmail}`);
        if (response.length !== 0) {
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
  }, [userEmail, normalUserDetail, apiBaseUrl]);

  const filterEvents = () => {
    let uniqueEvents = events;
    let filteredByDate = events;
    let filteredByWeekday = events;
    if (date) {
      const inputDate = new Date(date);
      filteredByDate = filteredByDate.filter(event => {
        const eventStartDate = new Date(event.startdate);
        const eventEndDate = new Date(event.enddate);
        inputDate.setHours(0, 0, 0, 0);
        eventStartDate.setHours(0, 0, 0, 0);
        eventEndDate.setHours(0, 0, 0, 0);
        return inputDate >= eventStartDate && inputDate <= eventEndDate && !event.repeat;
      });
      // 将日期字符串转换为 Date 对象
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayIndex = inputDate.getDay();
      filteredByWeekday = filteredByWeekday.filter(event => {
        const eventStartDate = new Date(event.startdate);
        const eventEndDate = new Date(event.enddate);
        inputDate.setHours(0, 0, 0, 0);
        eventStartDate.setHours(0, 0, 0, 0);
        eventEndDate.setHours(0, 0, 0, 0);
        return inputDate >= eventStartDate && inputDate <= eventEndDate && event.weekday === daysOfWeek[dayIndex]
      });
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

  const filterEventsByCategory = (e) => {
    setDate(null);
    setLocation(null);
    let uniqueEvents = orignevents;
    const categoryValue = Number(e.currentTarget.value);
    if (categoryValue !== 0) {
      uniqueEvents = uniqueEvents.filter(event => event.category.includes(categoryValue));
    }
    setEvents(uniqueEvents);
    setFilteredEvents(uniqueEvents);
  };
  const handleCategoryClick = (e, columnSeq) => {
    setSelectedCategory(columnSeq);
    filterEventsByCategory(e); // 执行过滤逻辑
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
  // Pagination handlers
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
    if (event.key === 'Enter') {
      filterEvents(); // 检测到回车键时触发 filterEvents
    }
  };
  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.select();  // 全选日期
    }
  };
  const handleMouseEnter = (date) => {
    setHoveredDate(date);
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  // 自定义日期样式
  const dayPropGetter = (date) => {
    const isHovered = hoveredDate && moment(date).isSame(hoveredDate, 'day'); // 检查是否悬停在当前日期
    return {
      style: {
        backgroundColor: isHovered ? '#e0f7fa' : 'inherit', // 悬停时变色
        transition: 'background-color 0.1s ease', // 添加平滑的过渡效果
      },
      onMouseEnter: () => handleMouseEnter(date), // 处理鼠标悬停事件
      onMouseLeave: handleMouseLeave, // 处理鼠标离开事件
    };
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
    }
    else {
      navigate('/login');
    }
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
        setCurrentEvents(events);
      } catch (error) {
        console.error('Error updating like:', error);
      }
    } else {
      navigate('/login');
    }
  };
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        {/* 第一行的类别和加号/减号图标 */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
          {visibleCategories.slice(0, 6).map((category, index) => (
            <Button
              key={index}
              value={category.columnSeq}
              onClick={(e) => handleCategoryClick(e, category.columnSeq)}
              sx={{
                fontSize: { xs: '0.5rem', sm: '0.6rem', md: '0.8rem' },
                backgroundColor: selectedCategory === category.columnSeq ? '#6E45E2' : '#1976d2',
                color: '#fff',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: selectedCategory === category.columnSeq ? '#6E45E2' : '#1976d2',
                },
                borderRadius: '12px',
                padding: '8px 23px',
                // flexGrow: 1, // Allow the buttons to grow and shrink as necessary
              }}
            >
              {category.columnDetail}
            </Button>
          ))}

          {/* 加号/减号按钮 */}
          {eventCategorys.length > 6 && (
            <IconButton
              onClick={() => setShowAll((prev) => !prev)} // 切换显示状态
              sx={{ padding: 1 }}
            >
              {showAll ? <RemoveIcon /> : <AddIcon />}
            </IconButton>
          )}
        </Box>

        {/* 其余类别，仅在展开时显示 */}
        {showAll && (
          chunkCategories(eventCategorys.slice(6), 6).map((row, rowIndex) => (
            <Box key={rowIndex} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {row.map((category, index) => (
                <Button
                  key={index}
                  value={category.columnSeq}
                  onClick={(e) => handleCategoryClick(e, category.columnSeq)}
                  sx={{
                    fontSize: { xs: '0.5rem', sm: '0.6rem', md: '0.8rem' },
                    backgroundColor: selectedCategory === category.columnSeq ? '#6E45E2' : '#1976d2',
                    color: '#fff',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: selectedCategory === category.columnSeq ? '#6E45E2' : '#1976d2',
                    },
                    borderRadius: '12px',
                    padding: '8px 23px',
                    //  flexGrow: 1, // Allow the buttons to grow and shrink as necessary
                  }}
                >
                  {category.columnDetail}
                </Button>
              ))}
            </Box>
          ))
        )}
      </Box>
      {/* 日期选择和地点输入 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
        {/* Date Picker 和 Location 输入框 */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Date"
            value={date}
            onChange={(newValue) => setDate(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                inputRef={inputRef} // 绑定 inputRef
                onKeyDown={handleKeyDown} // 监听删除键
                onFocus={handleFocus}
              />
            )}
          />
        </LocalizationProvider>

        <TextField
          label="Location"
          value={location}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              filterEvents(); // 检测到回车键时触发 filterEvents
            }
          }}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Button variant="contained" className="button" onClick={filterEvents} sx={{ height: '50px' }}>
          Search
        </Button>

        {/* 添加一个 flex-grow 来使 List 和 Calendar 按钮在最右侧 */}
        <Box sx={{ flexGrow: 1 }} />

        {/* 切换视图按钮：List 和 Calendar */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="View mode toggle"
        >
          <ToggleButton value="list" aria-label="List View">
            <MenuIcon />
          </ToggleButton>
          <ToggleButton value="calendar" aria-label="Calendar View">
            <CalendarTodayIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 列表模式 */}
      {viewMode === 'list' ? (
        <Box
          sx={{
            mt: 4, // 增加检索框与卡片之间的距离 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4, // 控制卡片之间的间距
          }}
        >
          <Grid
            container
            spacing={4} // Control card spacing
            sx={{
              maxWidth: '960px', // 限制页面宽度
              margin: '0 auto', // 让内容居中
              rowGap: 6, // 增加每行之间的间距
            }}
          >
            {loading ? (
              <CircularProgress /> // 显示加载指示器
            ) : currentEvents.length === 0 ? (
              <Typography>No Events Available!</Typography>
            ) : (
              currentEvents.map((event) => (
                <Grid event xs={12} sm={6} md={4} key={event.eventId}>
                  <Card className="event-card"
                    sx={{
                      maxWidth: '280px', // 设置卡片的最大宽度
                      height: '100%', // 控制卡片高度
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: 1.5, // 缩小内边距
                      boxShadow: 3, // 添加阴影
                      transition: 'transform 0.2s', // 鼠标悬停时动画效果
                      '&:hover': {
                        transform: 'scale(1.05)', // 放大效果
                      },
                    }}
                    onClick={() => {
                      //  if (event.link) {
                      //    window.open(event.link, '_blank');
                      //  } else {
                      navigate(`/events/${event.eventId}`);
                      //  }
                    }}
                  >
                    <CardContent sx={{ flex: '1 1 auto' }}>
                      {event.images && event.images.length > 0 && (
                        <Box className="event-image-container">
                          <div style={{ width: '260px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img
                              src={`${event.images[getCurrentImageIndex(event.eventId)]}`}
                              alt={`Event Image ${getCurrentImageIndex(event.eventId) + 1}`}
                              className="event-image"
                            />
                          </div>
                          <Button
                            onClick={(e) => { e.stopPropagation(); handlePrevImage(event.eventId, event.images); }}
                            disabled={event.images.length <= 1}
                            className="arrow-button left-arrow"
                          >
                            &lt;
                          </Button>
                          <Button
                            onClick={(e) => { e.stopPropagation(); handleNextImage(event.eventId, event.images); }}
                            disabled={event.images.length <= 1}
                            className="arrow-button right-arrow"
                          >
                            &gt;
                          </Button>
                        </Box>
                      )}
                      <Typography variant="h5" className="event-title">
                        {event.title}
                      </Typography>
                      {/*
                  <Typography variant="body2" className="event-info"> 
                    <strong>Organizer:</strong> {event.organizer}
                  </Typography> */}
                      <Typography variant="body2" className="event-info">
                        <strong>Date:</strong> {event.repeat ? `Every ${event.weekday}(${event.startdate} ~ ${event.enddate})` : event.startdate === event.enddate ? event.startdate : `${event.startdate} ~ ${event.enddate}`}<br />
                        <strong>Time:</strong> {event.startTime} ~ {event.endTime}
                      </Typography>
                      <Typography variant="body2" className="event-info">
                        <strong>Location:</strong>{' '}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'underline' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {event.location}
                        </a>
                      </Typography>
                      <Typography variant="body2" component="div" sx={{
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }} />
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton className='button' onClick={(e) => { e.stopPropagation(); handleShareEvent(event); }}>
                          <ShareIcon />
                        </IconButton>
                        <Typography variant="body2">Share</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton className='button' onClick={(e) => { e.stopPropagation(); handleLike(event.eventId); }}>
                          {event.liked ? <FavoriteIcon sx={{ color: 'red' }} /> : <FavoriteBorderIcon />}
                        </IconButton>
                        {event.likes > 0 && <Typography variant="body2">{event.likes}</Typography>}
                      </Box>
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
        </Box>
      ) : (
        // 日历视图
        <Calendar
          localizer={localizer}
          events={eventListForCalendar}
          components={{
            week: {
              event: CustomEventForWeek, // Week view uses custom event renderer
            },
            day: {
              event: CustomEvent, // Day view uses custom event renderer
            },
            agenda: {
              event: CustomEvent, // agenda view uses custom event renderer
            },
          }}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', minHeight: '100vh', width: '100%', overflowY: 'auto', marginTop: '50px' }}
          onView={setView}
          step={60} // 确保以小时为单位划分时间段
          onSelectEvent={handleSelectEvent}
          dayPropGetter={dayPropGetter}
        />
      )}
      <ReservationDialog
        open={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        event={selectedEvent}
        normalUserDetail={normalUserDetail}
      />
    </div>
  );
}
export default NormalDashboard;
