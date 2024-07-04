import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { RiLogoutBoxFill } from 'react-icons/ri';
import { FaUser } from 'react-icons/fa';
import { MdLockReset, MdSort, MdOutlineFilterListOff, MdNotifications } from 'react-icons/md'; // Added MdNotifications
import { ImCancelCircle } from 'react-icons/im';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import Select from 'react-select';
import axios from 'axios';
import io from 'socket.io-client'; // Add socket.io-client
import { GrSystem } from "react-icons/gr";
import { FaFrownOpen } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";

const Header = () => {
    const location = useLocation();
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const userId = userDetails?._id;
    // console.log(typeof(userId))
    const urlParts = location.pathname.split('/@');
    let userName = '@' + urlParts[1];
    let userUrl = urlParts[0];
    if (userUrl === '/profile' || userUrl === '/dashboard') {
        userName = userDetails?.userName;
    }
    console.log(userName, userUrl);
    const { userNotifications, setUserNotifications, isAuthenticated, token, logout, allTags, setFilteredBlogs, blogs, setUserSearchResult, setSearchResult, profileBlogData, searchText, setSearchText } = useAuth();
    console.log(userNotifications)
    const [showProfileOptions, setShowProfileOptions] = useState(false);
    const [isFilterClicked, setIsFilterClicked] = useState(false);
    const [selectedTag, setSelectedTag] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [prevSelectedTag, setPrevSelectedTag] = useState([]);
    const [prevSelectedDate, setPrevSelectedDate] = useState('');
    const [prevSelectedSort, setPrevSelectedSort] = useState('');
    const [selectSort, setSelectSort] = useState('');
    const [isCount, setIsCount] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const notificationRef = useRef(null);







    const togglePopup = () => {
        setIsOpen(!isOpen);
    }


    const closeNotification = () => {
        setIsOpen(false);
    }
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsOpen(false);

            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    console.log(userNotifications)

    // Added states for notifications
    const [notifications, setNotifications] = useState([]);

    const allTagsOptions =  allTags.map(tag => ({ value: tag, label: tag }));
    useEffect(() => {
        const socket = io( `${process.env.REACT_APP_SERVER_IP_ADDRESS}`);
        socket.emit('join', userId);
        socket.on('notification', (notification) => {
            console.log('Notification: ', notification)
            setUserNotifications((prev => [notification, ...prev]));
            console.log(notification);
            // if(userNotifications.length === 0){
            //     setUserNotifications([notification]);
            // }
        });
        socket.on('read-notification', (allNotifications) => {
            console.log('Received updated unread notifications:', allNotifications);
            setUserNotifications(allNotifications);
            console.log(allNotifications)
        });
        socket.on('delete-notification', (allNotifications) => {
            setUserNotifications(allNotifications);
        });
        socket.on('subNotification', (allNotifications) => {
            setUserNotifications(allNotifications);
        })
        socket.on('subscription', (allNotifications) => {
            setUserNotifications(allNotifications);
        })
        return () => {
            socket.disconnect();
        };
    });

    // Handle new notification
    const handleSearchChange = (e) => {
        e.preventDefault();
        setSearchText(e.target.value);
    };

    const handleTagChange = (selectedOptions) => {
        setSelectedTag(selectedOptions);
    };

    const handleSortChange = (e) => {
        e.preventDefault();
        setSelectSort(e.target.value);
    };

    const handleDateChange = (e) => {
        e.preventDefault();
        setSelectedDate(e.target.value);
    };

    const handleFilterApply = () => {
        setPrevSelectedTag(selectedTag);
        setPrevSelectedDate(selectedDate);
        setPrevSelectedSort(selectSort);
        setIsFilterClicked(false);
        setIsCount(true);
        applyFilters();
    };

    const handleFilterModalClose = () => {
        setSelectedTag(prevSelectedTag);
        setSelectedDate(prevSelectedDate);
        setSelectSort(prevSelectedSort);
        setIsFilterClicked(false);
    };

    const handleFilterClearFields = () => {
        setFilteredBlogs(blogs);
        setSelectedTag([]);
        setSelectedDate('');
        setSelectSort('');
        setPrevSelectedSort('');
        setPrevSelectedTag([]);
        setPrevSelectedDate('');
        setIsCount(false);
    };

    const handleFilterClearClick = () => {
        setIsCount(false);
        setSelectedTag([]);
        setSelectedDate('');
        setSelectSort('');
        setPrevSelectedSort('');
        setPrevSelectedTag([]);
        setPrevSelectedDate('');
        setSearchText('');
        setFilteredBlogs(blogs);
        setUserSearchResult(profileBlogData);
    };

    const applyFilters = async () => {
        const tags = selectedTag.map(option => option.value);
        const headers = { Authorization: `Bearer ${token}` };
        if (searchText.trim() !== '' || selectedDate || selectedTag || selectSort) {
            let response;
            if (userUrl === '/profile' || '/user-profile' || '/dashboard') {
                response = await axios.get( `${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/search?search=${encodeURIComponent(searchText)}&createdDate=${selectedDate}&selectedTag=${encodeURIComponent(tags.join(','))}&selectedSort=${selectSort}&userName=${encodeURIComponent(userName)}`, { headers });
                setUserSearchResult(response?.data?.response?.searchResult);
                setSearchResult(response?.data?.response?.searchResult);
            } else {
                response = await axios.get( `${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/search?search=${encodeURIComponent(searchText)}&createdDate=${selectedDate}&selectedTag=${encodeURIComponent(tags.join(','))}&selectedSort=${selectSort}`, { headers });
            }
            setFilteredBlogs(response?.data?.response?.searchResult);
        } else {
            setFilteredBlogs(blogs);
        }
    };

    const acceptRequest = async (notId, senderUserName) => {
        const headers = { Authorization: `Bearer ${token}` };
        console.log(notId, senderUserName)
        try {
            const response = axios.put( `${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/subscribe?notificationId=${encodeURIComponent(notId)}&subscriberName=${encodeURIComponent(senderUserName)}` , {}, { headers });
            console.log(response)
        } catch (error) {
            console.log(error)
        }
    }

    const rejectRequest = async (notId, senderUserName) => {
        const headers = { Authorization: `Bearer ${token}` };
        console.log(senderUserName)
        try {
            const response = await axios.delete(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/reject-request?notificationId=${encodeURIComponent(notId)}&subscriberName=${encodeURIComponent(senderUserName)}`, { headers });
            console.log(response)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchText]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showProfileOptions && !event.target.closest('.profile-options-container')) {
                setShowProfileOptions(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showProfileOptions]);

    useEffect(() => {
        handleFilterClearClick();
    }, [location]);

    useEffect(() => {
        setIsOpen(false)
        setShowProfileOptions(false);
    }, [location]);

    const handleNotificationClose = async (notificationId) => {
        try {
            console.log(notificationId);
            const response = await axios.post(
                 `${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/read-notification/${notificationId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.status) {
                // Remove the notification from the state on successful close
                console.log(response)
                setNotifications(prevNotifications =>
                    prevNotifications.filter(notification => notification._id !== notificationId)
                );
            } else {
                console.error('Failed to mark notification as read:', response.data.message);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };
    // console.log('userNotifications------------------', userNotifications)
    // console.log('Notifications------------------', notifications);
    // const allNotifications = notifications.length === 0 ? userNotifications : [...notifications];
    // console.log(allNotifications)
    // useEffect(() => {
    //     const handleNotificationClickOutside = (event) => {
    //         if (isOpen && notificationRef.current && !notificationRef.current.contains(event.target)) {
    //             setIsOpen(false);
    //         }
    //     };

    //     document.addEventListener('click', handleNotificationClickOutside);
    //     return () => {
    //         document.removeEventListener('click', handleNotificationClickOutside);
    //     };
    // }, [isOpen]);

    const allNotificationsArray = Object.values(userNotifications);
    const unreadNotifications = allNotificationsArray.filter(notification => !notification.isRead);

    function timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = Math.floor(seconds / 31536000);

        if (interval > 1) return `${interval} years ago`;
        if (interval === 1) return `a year ago`;

        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return `${interval} months ago`;
        if (interval === 1) return `a month ago`;

        interval = Math.floor(seconds / 86400);
        if (interval > 1) return `${interval} days ago`;
        if (interval === 1) return `a day ago`;

        interval = Math.floor(seconds / 3600);
        if (interval > 1) return `${interval} hours ago`;
        if (interval === 1) return `an hour ago`;

        interval = Math.floor(seconds / 60);
        if (interval > 1) return `${interval} minutes ago`;
        if (interval === 1) return `a minute ago`;

        return `${Math.floor(seconds)} seconds ago`;
    }
    return (
        <div className="sticky top-0 z-10 bg-gradient-to-br from-zinc-300 to-cyan-600">
            <div className="h-20 flex items-center justify-between px-6">
                <Link to='/'>
                    <h2 className="text-2xl font-bold text-fuchsia-100">Blog App</h2>
                </Link>
                <div className="flex items-center gap-4 min-w-1/2">
                    <div className="flex items-center gap-4">
                        <input
                            placeholder='Search blogs...'
                            className='border border-solid'
                            style={{ height: '32px', borderRadius: '5px', paddingLeft: '10px' }}
                            type="text"
                            onChange={handleSearchChange}
                            value={searchText}
                        />
                        <div className='flex items-center gap-2'>
                            <button
                                className='p-1 border h-[32px] rounded-[5px] bg-gray-200 text-zinc-600'
                                onClick={() => setIsFilterClicked(true)}
                            >
                                <div className='flex gap-2 items-center'>
                                    <MdSort />
                                    Filter
                                    {isCount && (
                                        <div className="text-white w-3 h-3 bg-orange-500 rounded-full"></div>
                                    )}
                                </div>
                            </button>
                            {isCount && (
                                <>
                                    <button
                                        data-tip
                                        data-tooltip-id="tooltip-default"
                                        data-tooltip-variant="dark"
                                        data-tooltip-place="right"
                                        className='p-2 border rounded-[5px] bg-gray-200 text-zinc-600'
                                        onClick={handleFilterClearClick}
                                    >
                                        <MdOutlineFilterListOff />
                                    </button>
                                    <ReactTooltip id="tooltip-default" place="top" effect="solid">
                                        Clear Filters
                                    </ReactTooltip>
                                </>
                            )}
                        </div>
                    </div>
                    {isAuthenticated() ? (
                        <div className="relative flex items-center gap-4">
                            <div className="relative profile-options-container">
                                <img
                                    className="h-[32px] w-[32px] rounded-full transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                                    src={userDetails?.profilePic}
                                    alt="User avatar"
                                    onClick={() => setShowProfileOptions(!showProfileOptions)}
                                />
                                {showProfileOptions && (
                                    <div className="absolute top-full right-0 bg-white shadow-md rounded-lg mt-2 py-2 px-4 w-72 overflow-hidden">
                                        <div className="flex items-center gap-4 px-4 py-2 border-b-2">
                                            <img
                                                className="h-6 w-6 rounded-full transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                src={userDetails?.profilePic}
                                                alt="User avatar"
                                            />
                                            <div>
                                                <p className="font-semibold">{userDetails?.fullName}</p>
                                                <p className="text-gray-500 text-sm">{userDetails?.userName}</p>
                                            </div>
                                        </div>
                                        <ul className='mt-3'>
                                            <Link to='/profile'>
                                                <li className="flex items-center gap-4 px-4 py-2 text-gray-500 cursor-pointer">
                                                    <FaUser />
                                                    Profile
                                                </li>
                                            </Link>
                                            <Link to='/change-password'>
                                                <li className="flex items-center gap-4 px-4 py-2 text-gray-500 cursor-pointer">
                                                    <MdLockReset />
                                                    Change Password
                                                </li>
                                            </Link>
                                            <li
                                                className="flex items-center gap-4 px-4 py-2 text-gray-500 cursor-pointer"
                                                onClick={() => logout()}
                                            >
                                                <RiLogoutBoxFill />
                                                Logout
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="relative cursor-pointer" onClick={togglePopup}>
                                <MdNotifications size={24} />
                                {userNotifications && (
                                    <span className={unreadNotifications.length > 0 ? `absolute top-0 right-0 w-4 h-4 bg-red-500  text-white text-xs rounded-full flex items-center justify-center` : ''}>
                                        {unreadNotifications.length > 0 ? unreadNotifications.length : ''}
                                    </span>
                                )}
                            </div>
                            {isOpen && (
                                <div ref={notificationRef} className="absolute top-full right-0 bg-white shadow-lg rounded-lg mt-2 lg:w-[900px] sm:w-[600px] md:w-[600px] max-h-80 overflow-y-auto z-50">
                                    <div className="p-4 border-b  border-gray-200 flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-gray-800">Notifications {unreadNotifications.length > 0 ? unreadNotifications.length : ''}
                                        </h2>
                                        <MdOutlineCancel className='text-lg' onClick={closeNotification} />
                                    </div>
                                    <div>
                                        {userNotifications.length > 0 ? (
                                            userNotifications.map((notification, index) => (
                                                // <Link key={index} to={`/blog/${notification?.blogId}`}>
                                                <div
                                                    // onClick={() => handleNotificationClose(notification._id)}
                                                    className={`px-4 py-3 border-b last:border-0 relative ${!notification.isRead ? 'bg-gray-100' : 'bg-white'} hover:bg-gray-50 transition duration-150 ease-in-out`}
                                                >
                                                    <div className='flex items-center gap-2 flex-wrap'>
                                                        <div className="break-words w-full flex flex-col sm:flex-row sm:items-center">
                                                            {(() => {
                                                                switch (notification?.type) {
                                                                    case 'comment':
                                                                    case 'like':
                                                                    case 'upload-veiw':
                                                                        return (
                                                                            <div className='w-full flex gap-1 flex-col sm:flex-row sm:items-center relative'>
                                                                                <Link className='flex gap-2 items-center hover:underline w-full sm:w-auto' to={`/user-profile/${notification?.otherUserName}`}>
                                                                                    <img
                                                                                        className="h-8 w-8 rounded-full transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                                                        src={notification?.otherUserProfilePic}
                                                                                        alt="User avatar"
                                                                                    />
                                                                                    <span className='font-bold'>{notification?.otherUserName} </span>
                                                                                </Link>
                                                                                <div className="flex gap-2 items-center">
                                                                                    <Link className='hover:underline' to={`/blog/${notification?.blogId}`}>{` ${notification.message}`}</Link>
                                                                                    {notification?.type === 'comment' && <span className="break-words">{" : " + notification.commentText}</span>}
                                                                                    <span className="text-gray-500 text-sm ml-2 block sm:inline">{timeAgo(notification.createdAt)}</span>
                                                                                </div>
                                                                                {!notification?.isRead &&
                                                                                    <button
                                                                                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200"
                                                                                        onClick={() => handleNotificationClose(notification._id)}
                                                                                    >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                                                                            <path fillRule="evenodd" d="M2.293 3.293a1 1 0 011.414 0L10 8.586l6.293-6.293a1 1 0 111.414 1.414L11.414 10l6.293 6.293a1 1 0 11-1.414 1.414L10 11.414l-6.293 6.293a1 1 0 01-1.414-1.414L8.586 10 2.293 3.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                    </button>}
                                                                            </div>
                                                                        );
                                                                    case 'subscription':
                                                                        return (
                                                                            <div className='w-full flex gap-1 flex-col sm:flex-row sm:items-center relative'>
                                                                                <Link className='flex gap-2 items-center hover:underline w-full sm:w-auto' to={`/user-profile/${notification?.otherUserName}`}>
                                                                                    <img
                                                                                        className="h-8 w-8 rounded-full transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                                                        src={notification?.otherUserProfilePic}
                                                                                        alt="User avatar"
                                                                                    />
                                                                                    <span className='font-bold'>{notification?.otherUserName} </span>
                                                                                </Link>
                                                                                <div className="flex gap-2 items-center">
                                                                                    {` ${notification.message}`}
                                                                                    {notification?.type === 'comment' && <span className="break-words">{" : " + notification.commentText}</span>}
                                                                                    <span className="text-gray-500 text-sm ml-2 block sm:inline">{timeAgo(notification.createdAt)}</span>
                                                                                </div>
                                                                                {!notification?.isRead &&
                                                                                    <button
                                                                                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200"
                                                                                        onClick={() => handleNotificationClose(notification._id)}
                                                                                    >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                                                                            <path fillRule="evenodd" d="M2.293 3.293a1 1 0 011.414 0L10 8.586l6.293-6.293a1 1 0 111.414 1.414L11.414 10l6.293 6.293a1 1 0 11-1.414 1.414L10 11.414l-6.293 6.293a1 1 0 01-1.414-1.414L8.586 10 2.293 3.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                    </button>}
                                                                            </div>
                                                                        )
                                                                    case 'request':
                                                                        return (
                                                                            <div className='w-full flex gap-1 flex-col sm:flex-row sm:items-center relative'>
                                                                                <Link className='flex gap-2 items-center hover:underline w-full sm:w-auto' to={`/user-profile/${notification?.otherUserName}`}>
                                                                                    <img
                                                                                        className="h-8 w-8 rounded-full transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                                                                                        src={notification?.otherUserProfilePic}
                                                                                        alt="User avatar"
                                                                                    />
                                                                                    <span className='font-bold'>{notification?.otherUserName} </span>
                                                                                </Link>
                                                                                <div className="flex gap-2 items-center">
                                                                                    <span>{` ${notification.message}`}</span>
                                                                                    <button
                                                                                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                                                                        onClick={() => acceptRequest(notification?._id, notification.otherUserName)}
                                                                                    >
                                                                                        Accept
                                                                                    </button>
                                                                                    <button
                                                                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                                                                        onClick={() => rejectRequest(notification?._id, notification.otherUserName)}
                                                                                    >
                                                                                        Reject
                                                                                    </button>
                                                                                    <span className="text-gray-500 text-sm ml-2 block sm:inline">{timeAgo(notification.createdAt)}</span>
                                                                                </div>
                                                                                
                                                                            </div>
                                                                        );
                                                                    default:
                                                                        return (
                                                                            <div className='w-full relative'>
                                                                                <strong className='flex items-center gap-1'>
                                                                                    <GrSystem className='h-6 w-6' />
                                                                                    System generated:
                                                                                </strong>
                                                                                {`${notification?.message}`}
                                                                                <span className="text-gray-500 text-sm ml-2 block sm:inline">{timeAgo(notification.createdAt)}</span>
                                                                                {!notification?.isRead &&
                                                                                    <button
                                                                                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200"
                                                                                        onClick={() => handleNotificationClose(notification._id)}
                                                                                    >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                                                                            <path fillRule="evenodd" d="M2.293 3.293a1 1 0 011.414 0L10 8.586l6.293-6.293a1 1 0 111.414 1.414L11.414 10l6.293 6.293a1 1 0 11-1.414 1.414L10 11.414l-6.293 6.293a1 1 0 01-1.414-1.414L8.586 10 2.293 3.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                    </button>}
                                                                            </div>
                                                                        );
                                                                }

                                                            })()}
                                                        </div>
                                                    </div>

                                                </div>
                                                // </Link>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-gray-500 flex items-center gap-3 justify-center">
                                                You're all caught up.

                                                <FaFrownOpen />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}





                        </div>
                    ) : (
                        <Link to="/login">
                            <button className="text-white bg-blue-500 hover:bg-blue-700 rounded py-2 px-4">
                                Login
                            </button>
                        </Link>
                    )}
                </div>
            </div>
            {isFilterClicked && (
                <div className='fixed inset-0 flex items-center w-full justify-center bg-black bg-opacity-30 z-50'>
                    <div className='bg-white p-8 rounded-lg w-1/3'>
                        <div className='flex justify-between mb-4'>
                            <h2 className='text-xl font-bold mb-2'>Filter Blogs</h2>
                            <button onClick={handleFilterModalClose}>
                                <ImCancelCircle size={24} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2">Tags</label>
                            <Select
                                isMulti
                                value={selectedTag}
                                onChange={handleTagChange}
                                options={allTagsOptions}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2">Date</label>
                            <input type="date" className="border rounded p-2 w-full" value={selectedDate} onChange={handleDateChange} />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2">Sort by</label>
                            <select value={selectSort} onChange={handleSortChange} className="border rounded p-2 w-full">
                                <option value="">Select</option>
                                <option value="today">today</option>
                                <option value="yesterday">yesterday</option>
                                <option value="lastWeek">Last week</option>
                                <option value="lastMonth">Last month</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button className="bg-red-500 text-white py-2 px-4 rounded" onClick={handleFilterClearFields}>Clear</button>
                            <button className="bg-green-500 text-white py-2 px-4 rounded" onClick={handleFilterApply}>Apply</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;
