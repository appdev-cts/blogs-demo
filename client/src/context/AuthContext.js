// AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [blogs, setBlogs] = useState([]); // State to store the fetched blogs
  const [filteredBlogs, setFilteredBlogs] = useState([])
  const [allTags, setAlltags] = useState([]);
  const [user, setUser] = useState('');
  const [userSearchResult, setUserSearchResult] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [profilePic, setProfilePic] = useState('')
  const [profileBlogData, setProfileBlogData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [likeBtnClicked, setLikeBtnClicked] = useState(false);
  const [userNotifications, setUserNotifications] = useState({});
  const [isNotFoud, setIsNotFound] = useState(false);
  useEffect(() => {
    if (token) {
      fetchBlogs();
      fetchNotifications();
    }
  }, [token]);
  const userDetails = localStorage.getItem('userDetails')
  const id = userDetails?._id
  const login = (userDetails) => {
    // console.log(profilePic);
    const socket = io( `${process.env.REACT_APP_SERVER_IP_ADDRESS}`);
    socket.emit('join', id);
    localStorage.setItem('token', userDetails.userToken);
    localStorage.setItem('profilePic', userDetails.profilePic);
    localStorage.setItem('userDetails', JSON.stringify(userDetails))
    setToken(userDetails?.userToken);
    setProfilePic(userDetails?.profilePic);
    fetchNotifications();
  };

  const storeUser = (fullName) => {
    localStorage.setItem('fullName', fullName)
    setUser(fullName)
  }
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profilePic')
    localStorage.removeItem('userDetails')
    setToken(null);
    setProfilePic('');
  };

  const isAuthenticated = () => {
    return token !== null;
  };

  const fetchBlogs = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };
      const response = await axios.get( `${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users`, { headers });
      // console.log(response?.data?.response?.tags);
      setBlogs(response?.data?.response?.uploadedReverseBlogs);
      setAlltags(response?.data?.response?.tags)
      setFilteredBlogs(response?.data?.response?.uploadedReverseBlogs)
      // console.log(blogs); // Store fetched blogs in state
    } catch (error) {
      setBlogs([]);
      setAlltags([]);
      setFilteredBlogs([]);
      setIsNotFound(true);
      console.error('Error fetching blogs:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };
      const response = await axios.get( `${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/getNotifications`, { headers });
      console.log(response)
      setUserNotifications(response?.data?.response)
    } catch (error) {

    }
  }

  useEffect(() => {
    const socket = io( `${process.env.REACT_APP_SERVER_IP_ADDRESS}`);

    socket.on('blogUpdate', (liveBlogs) => {

      setTimeout(() => {
        fetchBlogs();
      }, 2000)
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const socket = io( `${process.env.REACT_APP_SERVER_IP_ADDRESS}`); // Adjust the URL if your server is hosted elsewhere
    // Join a room specific to this blog post
    // Listen for like updates
    socket.on('deleteBlog', (liveBlogs) => {
      // console.log(updatedComment)
      setTimeout(() => {
        fetchBlogs();
      }, 2000)
    });
    // Clean up on component unmount
    return () => {
      //   socket.emit('leaveBlog', { blogId: blogId });
      socket.disconnect();
    };
  }, []);
  // console.log(blogs);
  return (
    <AuthContext.Provider value={{
      storeUser,
      profilePic,
      allTags, user,
      token, blogs,
      login, setFilteredBlogs,
      filteredBlogs, logout,
      isAuthenticated, fetchBlogs,
      userSearchResult, setUserSearchResult,
      searchResult, setSearchResult,
      profileBlogData, setProfileBlogData,
      searchText, setSearchText,
      likeBtnClicked, setLikeBtnClicked,
      userNotifications, setUserNotifications,
      isNotFoud
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
