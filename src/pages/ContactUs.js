import React, { useEffect, useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import axios from 'axios';  // Use Axios to send the email
import '../App.css';
import TopNavBar from '../components/TopNavBar';
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');  // 初始化 userName 为空字符串
  const userEmail = localStorage.getItem('userEmail');  //用户的邮箱
  const userRole = localStorage.getItem('userRole');  //用户角色
  const [isLoggedIn, setIsLoggedIn] = useState(!!userEmail);  // 检查是否已登录
  const [anchorEl, setAnchorEl] = useState(null);  // 控制菜单
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
  }, [userEmail, userRole]);
  const handleSubmit = async () => {
    try {
      // API call to send the message
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/contact`, { name, email, message });
      setSuccess('Your message has been sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError('There was a problem sending your message.');
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
      <Container component="main" className="contact-container">
        <Typography variant="h4" component="h1" gutterBottom>
          Contact Us
        </Typography>

        {error && <Typography color="error">{error}</Typography>}
        {success && <Typography color="success">{success}</Typography>}

        <TextField
          label="Your Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Your Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Your Message"
          fullWidth
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          margin="normal"
        />
        <Button className='button' variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
          Send Message
        </Button>
      </Container>
    </div>
  );
};

export default ContactUs;
