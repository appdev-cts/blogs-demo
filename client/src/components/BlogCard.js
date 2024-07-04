import React, { useState,useEffect } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { DateTime } from 'luxon'
import { useAuth } from '../context/AuthContext';
import { FcLike } from "react-icons/fc";
import io from 'socket.io-client';

const BlogCard = (props) => {
    console.log(props);
    const { isAuthenticated } = useAuth();
    const userDetails = JSON.parse(localStorage.getItem('userDetails'))
    const { tittle, content, tags, authorDetails, _id, date, likes } = props?.data;
    const { fullName, profilePic, userName } = authorDetails;
    const [blogLikes, setBlogLikes] = useState(likes || []);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const istTime = DateTime.fromISO(date).setZone(userTimeZone).toFormat('dd LLL yyyy').toLocaleString(DateTime.DATE_SHORT);
    // State to track whether the content is expanded
    const [isExpanded, setIsExpanded] = useState(false);
    const calculateReadTime = (content) => {
        const article = content.split(' ');
        const count = article.length
        const wordsPerMinute = 200;
        const readingTime = Math.ceil(count / wordsPerMinute);
        return readingTime
    }
    useEffect(() => {
        const socket = io(`${process.env.REACT_APP_SERVER_IP_ADDRESS}`); // Adjust the URL if your server is hosted elsewhere
        // Join a room specific to this blog post
        socket.emit('joinBlog', { blogId: _id });
        // Listen for like updates
        socket.on('likeUpdate', (updatedLikes) => {
            setBlogLikes(updatedLikes);
        });
        // Clean up on component unmount
        return () => {
          socket.emit('leaveBlog', { blogId: _id });
          socket.disconnect();
        };
      }, []);
    // Function to toggle the content expansion
    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };
    console.log(blogLikes)
    return (

        <div className="flex justify-center min-w-full px-24">
                <div className="min-w-full border rounded-lg overflow-hidden shadow-lg mx-4 my-8 " style={{ height: '400px' }}>
                <Link to={`/blog/${_id}`}>
                    <div className="px-6 py-4 h-full flex flex-col justify-between">
                        <div>
                            <div className='flex items-center gap-2'>
                                <Link to={(isAuthenticated() && fullName === 'You') ? '/profile' : `/user-profile/${userName}`}>
                                    <img className="h-7 w-7 rounded-full border-black border-2  transform hover:scale-105 transition-transform duration-300" src={profilePic} alt="User avatar" />
                                </Link>

                                <div>
                                    <div className='flex gap-2 text-gray-600'>
                                        <Link to={isAuthenticated() && fullName === 'You' ? '/profile' : `/user-profile/${userName}`}> <p className='hover:underline text-black'>{fullName} - {userName}</p></Link>
                                        <p>.</p>
                                        <p className='flex gap-1 items-center'> <span className='underline'>Likes</span>{blogLikes.length}</p>
                                        {console.log(blogLikes)}
                                    </div>
                                </div>
                            </div>

                            <div className="font-bold text-xl mb-2 mt-5 text-black">
                                {tittle}
                            </div>
                            <div className="text-black text-base overflow-hidden" style={{ maxHeight: '150px' }}>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(isExpanded ? content : `${content.slice(0, 500)}...`),
                                    }}
                                ></div>
                            </div>
                            {content.length > 500 && (
                                <button
                                    onClick={toggleExpansion}
                                    className="text-blue-500 hover:text-blue-300 font-semibold focus:outline-none"
                                >
                                    {isExpanded ? 'See Less' : 'See More'}
                                </button>
                            )}
                        </div>
                        <div className="px-6 py-4 flex items-center justify-between">
                            <div>
                                {tags.map((tag, index) => (
                                    <span key={index} className="inline-block bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-300 mr-2">{tag}</span>
                                ))}
                            </div>
                            <div className='text-black flex items-center gap-2'>
                                <p className=' underline'>{calculateReadTime(content) + " min read"}</p>
                                <p>.</p>
                                {istTime}
                            </div>
                        </div>
                    </div>
                    </Link>

                </div>
        </div>
    );
};


export default BlogCard;

