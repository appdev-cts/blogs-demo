
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom'
import DOMPurify from 'dompurify';
import { MdCancel, MdOutlineVerified } from "react-icons/md";
import { AiOutlineMail } from "react-icons/ai";
import { FaMale, FaFemale } from "react-icons/fa";
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { useAuth } from '../context/AuthContext';
import { DateTime } from 'luxon'
import { FaFaceFrown } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";


import io from 'socket.io-client';

import { FaUserClock } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { RiUserFollowFill } from "react-icons/ri";
import { GiThreeFriends } from "react-icons/gi";
import { SlUserFollow } from "react-icons/sl";

const UserProfile = () => {
    const { searchResult, setSearchResult, searchText } = useAuth();
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({});
    const [blogs, setBlogs] = useState([]);
    const [subscribed, setSubscribed] = useState(false);
    const [status, setStatus] = useState('');
    const { userName } = useParams()
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [mutualConnections, setMutualConnections] = useState([]); // New state for mutual connections
    const [subscribedToSidebarOpen, setSubscribedToSidebarOpen] = useState(false); // State for following sidebar visibility
    const [subscriberSidebarOpen, setSubscriberSidebarOpen] = useState(false); // State for followers sidebar visibility

    const [channelsSubscribedToDetails, setChannelsSubscribedToDetails] = useState([]);
    const [subscribersDetails, setSubscribersDetails] = useState([]);
    const [mutualConnectionsSidebarOpen, setMutualConnectionsSidebarOpen] = useState(false); // State for mutual connections sidebar visibility
    const refSidebarModal = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (refSidebarModal.current && !refSidebarModal.current.contains(event.target)) {
                setMutualConnectionsSidebarOpen(false);
                setSubscribedToSidebarOpen(false);
                setSubscriberSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const openMutualConnectionsSidebar = () => {
        setSubscribedToSidebarOpen(false);
        setSubscriberSidebarOpen(false);
        setMutualConnectionsSidebarOpen(true);
    };

    // Function to close the mutual connections sidebar
    const closeMutualConnectionsSidebar = () => {
        setMutualConnectionsSidebarOpen(false);
    };


    const openSubscribedToSidebar = () => {
        setSubscriberSidebarOpen(false);
        setMutualConnectionsSidebarOpen(false);
        setSubscribedToSidebarOpen(true);
    };

    // Function to close the following sidebar
    const closeSubscribedToSidebar = () => {
        setSubscribedToSidebarOpen(false);
    };
    const openSubscribersSidebar = () => {
        setSubscribedToSidebarOpen(false);
        setMutualConnectionsSidebarOpen(false);
        setSubscriberSidebarOpen(true);
    };

    // Function to close the followers sidebar
    const closeSubscribersSidebar = () => {
        setSubscriberSidebarOpen(false);
    };

    const userId = userDetails?._id;

    const socket = io(`${process.env.REACT_APP_SERVER_IP_ADDRESS}`); // Replace with your WebSocket server URL

    useEffect(() => {
        socket.emit('join', userId)
        // Listener for follower count update
        socket.on('followerCountUpdate', ({ count, followers }) => {
            setSubscribersDetails(followers);
            console.log(followers)
        });

        // Listener for following count update
        socket.on('followingCountUpdate', ({ count, following }) => {
            setChannelsSubscribedToDetails(following);
            console.log('=============?', following)
        });
        socket.on('change_sub-status', (status) => {
            console.log(status)
            setStatus(status)
        })
        // return () => {
        //     // Clean up socket listeners when component unmounts
        //     socket.off('followerCountUpdate');
        //     socket.off('followingCountUpdate');
        // };
    },[]); // Empty dependency array to run only on mount and unmount



    let userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let istTime;
    if (userName === userDetails?.userName) {
        navigate('/profile')
    }
    console.log(userName);
    const { email, fullName, gender, isVerified, profilePic } = userData

    const { token } = useAuth()

    const sendSubRequest = async () => {
        try {
            const headers = {
                'Authorization': `Bearer ${token}`
            }
            const response = await axios.post(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/send-request/${userName}`, {}, { headers });
            console.log(response)
            setStatus(response?.data?.subscriptionStatus)
        } catch (error) {
            console.log(error)
        }
    }
    const triggerSubscribeBtn = async () => {
        try {
            const headers = {
                'Authorization': `Bearer ${token}` // Replace token with your actual token value
            }
            const response = await axios.post(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/subscribe/${userName}`, {}, { headers });
            console.log(response?.data?.response?.isSubscribed);
            setSubscribed(response?.data?.response?.isSubscribed);
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        const fetchSubscriptionDetails = async () => {
            const headers = {
                'Authorization': `Bearer ${token}` // Replace token with your actual token value
            }
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/count-subscription/${userName}`, { headers })
                console.log(response);
                setChannelsSubscribedToDetails(response?.data?.response?.subscribedToDetails)
                setSubscribersDetails(response?.data?.response?.subscribersDetails)
            } catch (error) {
                console.log(error)
            }
        }
        fetchSubscriptionDetails();
    }, [subscribed, status])
    useEffect(() => {
        const fetchSubscription = async () => {
            const headers = {
                'Authorization': `Bearer ${token}` // Replace token with your actual token value
            }
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/check-sunscription/${userName}`, { headers })
                console.log(response);
                setStatus(response?.data?.subscriptionStatus);
            } catch (error) {

            }
        }
        fetchSubscription();
    }, [status])

    const unSubscribeBtn = async (req, res) => {
        const headers = {
            'Authorization': `Bearer ${token}` // Replace token with your actual token value
        }
        try {
            const response = await axios.delete(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/un-subscribe/${userName}`, { headers })
            console.log(response);
            setSubscribed(response?.data?.response?.isSubscribed);
        } catch (error) {

        }
    }
    useEffect(() => {
        const fetchUserDetails = async () => {
            const headers = {
                'Authorization': `Bearer ${token}` // Replace token with your actual token value
            }
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/user-profile/${userName}`, { headers });
                const { user, blogPosts, mutualFollowers } = response?.data?.response
                // const { author } = blog;
                console.log(response);
                setBlogs(blogPosts);
                setSearchResult(blogPosts)
                setMutualConnections(mutualFollowers) // Set mutual connections
                setUserData(user)
                setLoading(false)
            } catch (error) {
                console.log(error);
                setLoading(false)
            }
        }
        fetchUserDetails();
    }, [userName])

    console.log(status);
    return (
        <div className="min-h-screen w-full">
            {loading ? (
                <div className="flex justify-center items-center">
                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32" style={{
                        borderColor: '#f3f3f3',
                        borderTopColor: '#3498db',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        animation: 'spin 2s linear infinite'
                    }}>
                        <style>
                            {`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}
                        </style>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-4xl mx-auto mb-8 p-6">
                    <div className="flex items-center justify-between mt-2 p-4 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex flex-col items-center">
                            <img className="h-32 w-32 rounded-full border-4 border-blue-500 transform hover:scale-105 transition-transform duration-300" src={profilePic} alt="User avatar" />
                            <h3 className=' text-lg text-gray-300 gap-1'>{userName}</h3>
                            <h2 className="text-xl font-semibold text-gray-800 mt-4 flex items-center gap-1">
                                {fullName} {isVerified === 'true' ? (
                                    <>
                                        <MdOutlineVerified
                                            data-tip
                                            data-tooltip-id="tooltip-default"
                                            data-tooltip-variant="dark"
                                            data-tooltip-place="right"
                                            className='text-blue-400'
                                        />
                                        <ReactTooltip id="tooltip-default" place="top" effect="solid">
                                            Verified User
                                        </ReactTooltip>
                                    </>
                                ) : (
                                    <>
                                        <MdCancel
                                            data-tip
                                            data-tooltip-id="tooltip-notVerified"
                                            data-tooltip-variant="dark"
                                            data-tooltip-place="right"
                                            className='text-red-400' />
                                        <ReactTooltip id="tooltip-notVerified" place="top" effect="solid">
                                            Not verified
                                        </ReactTooltip>
                                    </>
                                )}
                            </h2>
                        </div>

                        {/* New section for posts, followers, and following */}
                        <div className="flex  items-center gap-10 justify-center">
                            <div className='flex items-cente gap-10 justify-center'>
                                <div className="text-center">
                                    <p className="text-gray-600">{blogs.length}</p>
                                    <p className="text-lg font-semibold text-gray-800">Blogs</p>
                                </div>
                                <div className="text-center cursor-pointer" onClick={openSubscribersSidebar}>
                                    <p className="text-gray-600">{subscribersDetails.length}</p>
                                    <p className="text-lg font-semibold text-gray-800">Subscriber</p>
                                </div>
                                <div className="text-center cursor-pointer" onClick={openSubscribedToSidebar}>
                                    <p className="text-gray-600">{channelsSubscribedToDetails.length}</p>
                                    <p className="text-lg font-semibold text-gray-800">Subscribed To</p>
                                </div>
                            </div>




                            {mutualConnectionsSidebarOpen && (
                                <div ref={refSidebarModal} className="fixed inset-y-0 right-0 z-20 w-72 bg-white shadow-lg">
                                    <div className="flex items-center justify-between px-4 py-3 border-b">
                                        <h2 className="text-xl font-semibold">Mutual Connections</h2>
                                        <button className="text-gray-500 hover:text-gray-700" onClick={closeMutualConnectionsSidebar}>
                                            <IoCloseSharp className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <div className="overflow-y-auto max-h-screen">
                                        <div className="overflow-y-auto max-h-screen">
                                            {mutualConnections.length === 0 ? (
                                                <div className="p-3 text-center text-gray-500">No users found</div>
                                            ) : (
                                                mutualConnections.map((user) => (
                                                    <Link key={user._id} to={`/user-profile/${user.userName}`}>
                                                        <div className="flex items-center gap-2 p-3 hover:bg-gray-100">
                                                            <img
                                                                className="h-8 w-8 rounded-full"
                                                                src={user.profilePic ?? 'default-profile-pic-url'}  // Use a default profile picture URL if undefined
                                                                alt={`${user.fullName ?? 'User'}'s profile`}
                                                            />
                                                            <p className="hover:underline">{user.fullName ?? 'Unknown User'}</p>
                                                        </div>
                                                    </Link>
                                                ))
                                            )}
                                        </div>

                                    </div>
                                </div>
                            )}

                            {subscriberSidebarOpen && (
                                <div ref={refSidebarModal} className="fixed inset-y-0 right-0 z-20 w-72 bg-white shadow-lg">
                                    <div className="flex items-center justify-between px-4 py-3 border-b">
                                        <h2 className="text-xl font-semibold">Subscribers</h2>
                                        <button className="text-gray-500 hover:text-gray-700" onClick={closeSubscribersSidebar}>
                                            <IoCloseSharp className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <div className="overflow-y-auto max-h-screen">
                                        {subscribersDetails.length === 0 ? (
                                            <div className="p-3 text-center text-gray-500">No users found</div>
                                        ) : (
                                            subscribersDetails.map((follower) => (
                                                <Link key={follower.id} to={`/user-profile/${follower?.userName}`}>
                                                    <div className="flex items-center gap-2 p-3 hover:bg-gray-100">
                                                        <img
                                                            className="h-7 w-7 rounded-full"
                                                            src={follower?.profilePic ?? 'default-profile-pic-url'}  // Use a default profile picture URL if undefined
                                                            alt={`${follower?.fullName ?? 'User'}'s avatar`}
                                                        />
                                                        <p className="hover:underline">{follower?.fullName ?? 'Unknown User'}</p>
                                                    </div>
                                                </Link>
                                            ))
                                        )}
                                    </div>

                                </div>
                            )}



                            {subscribedToSidebarOpen && (
                                <div ref={refSidebarModal} className="fixed inset-y-0 right-0 z-20 w-72 bg-white shadow-lg">
                                    <div className="flex items-center justify-between px-4 py-3 border-b">
                                        <h2 className="text-xl font-semibold">Subscribed To</h2>
                                        <button className="text-gray-500 hover:text-gray-700" onClick={closeSubscribedToSidebar}>
                                            <IoCloseSharp className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <div className="overflow-y-auto max-h-screen">
                                        {channelsSubscribedToDetails.length === 0 ? (
                                            <div className="p-3 text-center text-gray-500">No users found</div>
                                        ) : (
                                            channelsSubscribedToDetails.map((follower) => (
                                                <Link key={follower.id} to={`/user-profile/${follower?.userName}`}>
                                                    <div className="flex items-center gap-2 p-3 hover:bg-gray-100">
                                                        <img
                                                            className="h-7 w-7 rounded-full"
                                                            src={follower?.profilePic ?? 'default-profile-pic-url'}  // Use a default profile picture URL if undefined
                                                            alt={`${follower?.fullName ?? 'User'}'s avatar`}
                                                        />
                                                        <p className="hover:underline">{follower?.fullName ?? 'Unknown User'}</p>
                                                    </div>
                                                </Link>
                                            ))
                                        )}
                                    </div>

                                </div>
                            )}
                        </div>

                        <div className="ml-8 text-left flex flex-col gap-2">
                            <div className='mb-10'>
                                {userName !== userDetails?.userName && ( // Only show subscribe button if not viewing own profile
                                    <button
                                        onClick={() => {
                                            if (status === "") {
                                                sendSubRequest();
                                            } else if (status === "accepted") {
                                                unSubscribeBtn();
                                            }
                                        }}
                                        className={`px-4 py-2 ${status === '' ? 'text-gray-600 bg-none border hover:bg-blue-600 hover:text-white' : 'bg-blue-500 text-white'} rounded-md focus:outline-none flex items-center gap-2`}
                                    >
                                        {status === 'accepted' ? (
                                            <p className='flex items-center gap-2'>
                                                <RiUserFollowFill />
                                                Subscribed
                                            </p>
                                        ) : (status === "pending" ? (
                                            <p className='flex items-center gap-2'>
                                                <FaUserClock />
                                                Pending
                                            </p>
                                        ) : (
                                            <p className='flex items-center gap-2'>
                                                <SlUserFollow />
                                                Subscribe
                                            </p>
                                        ))}
                                    </button>

                                )}
                            </div>

                            <p className="text-gray-600 flex items-center gap-2">
                                <AiOutlineMail className='text-yellow-500' />
                                {email}
                            </p>
                            <p className="text-gray-600 flex items-center gap-2">
                                <FaUserCircle />
                                {userName}
                            </p>
                            <p className="text-gray-600 flex items-center gap-2">
                                {gender === 'male' ? (<FaMale />) : (<FaFemale />)}
                                {gender}
                            </p>
                            <div className='flex items-center gap-2 text-gray-600'>
                                <GiThreeFriends />
                                <p>Mutual: <span className='cursor-pointer underline' onClick={openMutualConnectionsSidebar}>{mutualConnections.length}</span></p>
                            </div>
                        </div>
                    </div>


                    <div className="border-t border-gray-200 px-4 py-6">
                        <h2 className="text-2xl mt-4 font-semibold text-gray-800 mb-6 border-b-2">Blogs</h2>
                        {searchResult.length === 0 ? (
                            <div className=''>
                                {searchText.length > 0 && `Showing search result for: ${searchText}`}

                                {/* <Link to='/dashboard'>
                                <button
                                    data-tip
                                    data-tooltip-id="tooltip-default"
                                    data-tooltip-variant="dark"
                                    data-tooltip-place="top-start"
                                    className="border-b-2 w-full p-4 m-5 flex justify-center gap-2 max-w-32 items-center"
                                >
                                    <div className='flex items-center gap-2 whitespace-nowrap'>
                                        Write your first blog here <BiSolidNavigation />
                                    </div>
                                </button>
                            </Link>
                            <Tooltip id="tooltip-default" place="top" effect="solid">
                                Add your first blog.
                            </Tooltip> */}
                                <p className='flex items-center gap-2 justify-center'>No blogs found <FaFaceFrown /></p>
                            </div>
                        ) : (
                            <div className="w-full mt-5">
                                {searchResult.map(blog => (
                                    <Link key={blog._id} to={`/blog/${blog._id}`} className="block">
                                        <div className="h-80 border mt-10 w-full p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                            <div className='flex items-center gap-2'>
                                                <img className="h-7 w-7 rounded-full transform hover:scale-105 transition-transform duration-300" src={profilePic} alt="User avatar" />
                                                <p className='hover:underline'>{fullName}</p>
                                            </div>

                                            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">{blog.tittle}</h3>

                                            <div
                                                className="text-gray-700 overflow-hidden"
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitBoxOrient: 'vertical',
                                                    WebkitLineClamp: '5',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
                                            ></div>
                                            <div className="mt-10 flex items-center justify-between">
                                                <div>
                                                    {blog.tags.map((tag, index) => (
                                                        <span key={index} className="inline-block bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-300 mr-2">{tag}</span>
                                                    ))}
                                                </div>
                                                {
                                                    istTime = DateTime.fromISO(blog.date).setZone(userTimeZone).toFormat('dd LLL yyyy').toLocaleString(DateTime.DATE_SHORT)
                                                }
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;

