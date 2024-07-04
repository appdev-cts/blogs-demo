import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaPen } from 'react-icons/fa';
import DashboardCard from '../components/DashboardCard';
import UploadBlog from '../components/UploadBlog';
import { Tooltip } from 'react-tooltip'
import { FaFaceFrown } from "react-icons/fa6";
import io from 'socket.io-client';

const Dashboard = () => {
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth(); // Access isAuthenticated and logout from AuthContext
    const [isEditing, setIsEditing] = useState(false);
    const [fetchTrigger, setFetchTrigger] = useState(0);
    const { userSearchResult, setUserSearchResult, setProfileBlogData,searchText } = useAuth();

    const fetchData = async () => {
        const headers = {
            Authorization: `Bearer ${token}` // Replace token with your actual token value
        };
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/dashboard`, { headers });
            setUserData(response?.data?.response?.userBlogPosts);
            setUserSearchResult(response?.data?.response?.userBlogPosts)
            setProfileBlogData(response?.data?.response?.userBlogPosts)
            setLoading(false);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const socket = io(`${process.env.REACT_APP_SERVER_IP_ADDRESS}`); // Adjust the URL if your server is hosted elsewhere
        // Join a room specific to this blog post
        // Listen for like updates
        socket.on('blogUpdate', (liveBlogs) => {
          // console.log(updatedComment)
          setTimeout(()=>{
            fetchData();
          },2000)
        });
        // Clean up on component unmount
        return () => {
        //   socket.emit('leaveBlog', { blogId: blogId });
          socket.disconnect();
        };
      }, [fetchTrigger]);
    useEffect(() => {
        fetchData();
    }, [fetchTrigger])

    console.log(userData);
    // useEffect(() => {
    //     if (!isAuthenticated()) {
    //         navigate('/');
    //     }
    // }, [isAuthenticated, navigate]);

    const handleEditClick = (e) => {
        setIsEditing(true);
    };
    const effectFromChild = () => {
        setFetchTrigger(prev => prev + 1)
    }
    const handleEditFormClose = (e) => {
        setIsEditing(false);
    };

    return (
        <>
            {loading ? (
                <>
                    <div className='flex justify-center w-full items-center pt-5'>
                        <div className="relative items-center block max-w-sm p-6 bg-white border border-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-800 dark:hover:bg-gray-700">
                            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white opacity-20">Feching your blogs..</h5>
                            <div role="status" className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
                                <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    </div>
                </>) : (
                <>
                    {userData.length === 0 ? (
                        <div className="mt-5 flex flex-col items-center">
                            <div className='p-3 m-3 flex mt-5 w-full flex-wrap justify-center'>
                                <h1>Welcome, Create your first blog here</h1>
                            </div>
                            <button
                                data-tip
                                data-tooltip-id="tooltip-default"
                                data-tooltip-variant="dark"
                                data-tooltip-place="top-start"
                                className="border p-4 m-5 flex w-full justify-center gap-2 max-w-32 items-center"
                                onClick={handleEditClick}>
                                <div className='flex items-center gap-2'>
                                    Add New <FaPen />
                                </div>
                            </button>
                            <Tooltip id="tooltip-default" place="top" effect="solid">
                                Add your first blog.
                            </Tooltip>

                            {isEditing && <UploadBlog onClose={handleEditFormClose} onChildUpdate={effectFromChild} />}
                        </div>
                    ) : (
                        <>
                            <div className='flex flex-wrap justify-center' >
                                <div className=' p-3 m-3 flex w-full mt-5 text-lg flex-wrap justify-start'>
                                    <h1>Welcome back {userData[0]?.author?.fullName}</h1>
                                    <div className='w-full'>
                                        <h1>No. of blogs uploaded: - {userData.length}</h1>
                                    </div>
                                </div>

                                <div className="w-full lg:flex lg:justify-center">
                                    <button
                                        data-tip
                                        data-tooltip-id="tooltip-default"
                                        data-tooltip-variant="dark"
                                        data-tooltip-place="top-start"
                                        className="border p-4 m-5 flex w-full justify-center gap-2 max-w-32 items-center"
                                        onClick={handleEditClick}>
                                        <div className=' sm:flex sm:justify-center sm:items-center sm:gap-2 md:flex md:justify-center md:items-center md:gap-2'>
                                            Add New <FaPen />
                                        </div>
                                    </button>
                                    <Tooltip id="tooltip-default" place="top" effect="solid">
                                        Add new blog
                                    </Tooltip>
                                </div>
                                {userSearchResult.length === 0 ?
                                    <div className=''>
                                        {searchText.length > 0 && `Showing search result for: ${searchText}`}

                                        <p className='flex items-center gap-2 justify-center'>No blogs found <FaFaceFrown /></p>
                                    </div>
                                    :
                                    <>
                                        {userSearchResult.map((blog) => (
                                            <DashboardCard key={blog._id} blog={blog} onChildUpdate={effectFromChild} />
                                        ))}
                                    </>
                                }
                                {isEditing && <UploadBlog onClose={handleEditFormClose} onChildUpdate={effectFromChild} />}

                            </div>
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default Dashboard;
