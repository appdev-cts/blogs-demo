import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { MdCancel, MdOutlineVerified } from "react-icons/md";
import { AiOutlineMail } from "react-icons/ai";
import { FaMale, FaFemale } from "react-icons/fa";
import { DateTime } from 'luxon';
import { FaFaceFrown } from "react-icons/fa6";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { FaUserCircle } from "react-icons/fa";

const Profile = () => {
    const { userSearchResult, setUserSearchResult, setProfileBlogData, searchText, isAuthenticated } = useAuth();
    const { token } = useAuth();
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));

    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [channelsSubscribedToDetails, setChannelsSubscribedToDetails] = useState([]);
    const [subscribersDetails, setSubscribersDetails] = useState([]);
    const [subscribedToSidebarOpen, setSubscribedToSidebarOpen] = useState(false); // State for following sidebar visibility
    const [subscriberSidebarOpen, setSubscriberSidebarOpen] = useState(false); // State for followers sidebar visibility



    const refSidebarModal = useRef(null);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (refSidebarModal.current && !refSidebarModal.current.contains(event.target)) {
                setSubscribedToSidebarOpen(false);
                setSubscriberSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);



    const openSubscribedToSidebar = () => {
        setSubscriberSidebarOpen(false);
        setSubscribedToSidebarOpen(true);
    };

    // Function to close the following sidebar
    const closeSubscribedToSidebar = () => {
        setSubscribedToSidebarOpen(false);
    };
    const openSubscribersSidebar = () => {
        setSubscribedToSidebarOpen(false)
        setSubscriberSidebarOpen(true);
    };

    // Function to close the followers sidebar
    const closeSubscribersSidebar = () => {
        setSubscriberSidebarOpen(false);
    };





    const socket = io( `${process.env.REACT_APP_SERVER_IP_ADDRESS}`); // Replace with your WebSocket server URL
    const userId = userDetails?._id;

    useEffect(() => {
        socket.emit('join', userId)

        // Listener for follower count update
        socket.on('followerCountUpdate', ({ count, followers }) => {
            setSubscribersDetails(followers);
            console.log('----------------->', count, followers)
        });

        // Listener for following count update
        socket.on('followingCountUpdate', ({ count, following }) => {
            setChannelsSubscribedToDetails(following);
        });

        // return () => {
        //     // Clean up socket listeners when component unmounts
        //     socket.off('followerCountUpdate');
        //     socket.off('followingCountUpdate');
        // };
    }); // Empty dependency array to run only on mount and unmount



    let userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let istTime;

    useEffect(() => {
        const fetchData = async () => {
            const headers = {
                'Authorization': `Bearer ${token}`
            }
            try {
                const response = await axios.get( `${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/user-profile`, { headers });
                if (response) {
                    setUserData(response.data.response.user);
                    setUserSearchResult(response.data.response.user.blogs);
                    setProfileBlogData(response.data.response.user.blogs);
                    setLoading(false);
                }
            } catch (error) {
                console.log(error)
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const { email, fullName, isVerified, blogs, profilePic, gender } = userData;
    const userName = userDetails?.userName;
    console.log( `${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/user-profile/${userName}`)
    useEffect(() => {
        const fetchSubscriptionDetails = async () => {
            const headers = {
                'Authorization': `Bearer ${token}`
            }
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/count-subscription/${userName}`, { headers });
                setChannelsSubscribedToDetails(response.data.response.subscribedToDetails);
                setSubscribersDetails(response.data.response.subscribersDetails);
            } catch (error) {
                console.log(error);
            }
        };
        fetchSubscriptionDetails();
    }, [userName, token]);

    useEffect(() => {
        const fetchSubscription = async () => {
            const headers = {
                'Authorization': `Bearer ${token}`
            }
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/check-sunscription/${userName}`, { headers });
            } catch (error) {
                console.log(error);
            }
        };
        fetchSubscription();
    }, [userName, token]);


    return (
        <>
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
                    <div className="w-full mx-auto mb-8 p-6">
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
                                            {isAuthenticated() ?
                                                <Link to={'/verify-email'}>
                                                    <MdCancel
                                                        data-tip
                                                        data-tooltip-id="tooltip-notVerified"
                                                        data-tooltip-variant="dark"
                                                        data-tooltip-place="right"
                                                        className='text-red-400' />
                                                </Link> :
                                                <MdCancel
                                                    data-tip
                                                    data-tooltip-id="tooltip-notVerified"
                                                    data-tooltip-variant="dark"
                                                    data-tooltip-place="right"
                                                    className='text-red-400' />
                                            }
                                            <ReactTooltip id="tooltip-notVerified" place="top" effect="solid">
                                                Not verified
                                            </ReactTooltip>
                                        </>
                                    )}
                                </h2>
                            </div>

                            {/* New section for posts, followers, and following */}
                            <div className="flex  items-center gap-10 justify-center">
                                <div className="text-center">
                                    <p className="text-gray-600">{blogs.length}</p>
                                    <p className="text-lg font-semibold text-gray-800">Blogs</p>
                                </div>
                                <div className="text-center cursor-pointer" onClick={openSubscribersSidebar}>
                                    <p className="text-gray-600">{subscribersDetails.length}</p>
                                    <p className="text-lg font-semibold text-gray-800">Subscribers</p>
                                </div>
                                <div className="text-center cursor-pointer" onClick={openSubscribedToSidebar}>
                                    <p className="text-gray-600">{channelsSubscribedToDetails.length}</p>
                                    <p className="text-lg font-semibold text-gray-800">Subscribed To</p>
                                </div>


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



                                <Link to='/dashboard'>
                                    <p className='flex items-center gap-2 hover:underline'>
                                        <MdOutlineSpaceDashboard />
                                        Go to dashboard<span>{'->'}</span>
                                    </p>
                                </Link>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 px-4 py-6">
                            <h2 className="text-2xl mt-4 font-semibold text-gray-800 mb-6 border-b-2">Blogs</h2>
                            {userSearchResult.length === 0 ? (
                                <div className=''>
                                    {searchText.length > 0 && `Showing search result: ${searchText}`}
                                    <p className='flex items-center gap-2 justify-center'>No blogs found <FaFaceFrown /></p>
                                </div>
                            ) : (
                                <div className=" w-full mt-5 ">
                                    {searchText.length > 0 && `Showing search result for: ${searchText}`}
                                    {userSearchResult.map(blog => (
                                        <Link key={blog._id} to={`/blog/${blog._id}`} className="block">
                                            <div className="h-80 w-full mt-10 p-4 bg-white border rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
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

        </>
    );
}

export default Profile;
