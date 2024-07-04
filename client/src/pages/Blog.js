import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CommentForm from '../components/CommentForm';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import { FaEdit } from 'react-icons/fa';
import EditBlog from '../components/EditBlog';
import DOMPurify from 'dompurify';
import { DateTime } from 'luxon';
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import io from 'socket.io-client';

const Blog = () => {
  const { token, isAuthenticated,setLikeBtnClicked } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [blogData, setBlogData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [likeUserData, setLikeUserData] = useState({});
  const [editButton, setEditButton] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));
  const userId = userDetails?._id; // Assuming userDetails has an _id property for the user ID
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const istTime = DateTime.fromISO(blogData?.date).setZone(userTimeZone).toFormat('dd LLL yyyy').toLocaleString(DateTime.DATE_SHORT);
  const checkIsUser = () => {
    userDetails?.blogs?.map(blog => {
      if (blog === id) {
        setIsAuth(true);
      }
    });
  };
  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_SERVER_IP_ADDRESS}`); // Adjust the URL if your server is hosted elsewhere
    // Join a room specific to this blog post
    socket.emit('joinBlog', { blogId: id });
    // Listen for like updates
    socket.on('likeUpdate', (updatedLikes) => {
      setBlogData(prevData => ({ ...prevData, likes: updatedLikes }));
    });
    // Clean up on component unmount
    return () => {
      socket.emit('leaveBlog', { blogId: id });
      socket.disconnect();
    };
  }, []);
  const handleEditClick = () => {
    setEditButton(true);
  };

  const handleEditFormClose = () => {
    setEditButton(false);
  };

  const fetchBlog = async () => {
    const headers = {
      Authorization: `Bearer ${token}`
    };
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/blog/${id}`, { headers });
      console.log(response);
      setBlogData(response?.data?.response?.blog);
      setIsEdit(response?.data?.response?.isAllowedToEdit);
      const isLikedByUser = response?.data?.response?.blog?.likes.some(like => like._id === userId);
      setIsLiked(isLikedByUser);
      setLoading(false);
    } catch (error) {
      console.log(error?.response?.data?.message);
      if (error?.response?.data?.message) {
        navigate(-1);
      }
    }
  };
  const { likes } = blogData;
  console.log(likes)

  useEffect(() => {
    checkIsUser();
  }, []);

  useEffect(() => {
    fetchBlog();
  }, [fetchTrigger,id ]);

  const uploadLike = async () => {
    const headers = {
      Authorization: `Bearer ${token}`
    };
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/upload-like/${id}`, {}, { headers });
      console.log(response?.data?.response[0]);
      setIsLiked(!isLiked);
      setLikeBtnClicked(!isLiked)
      setLikeUserData(response?.data?.response[0])
      setFetchTrigger(prev => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      {loading ? (
        <div className='flex items-center justify-center pt-5'>
          <div className="relative items-center block max-w-sm p-6 bg-white border border-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-800 dark:hover:bg-gray-700">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white opacity-20">Loading blog post...</h5>
            <div role="status" className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
              <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto py-8">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4">
              <div className='flex justify-between items-center'>
                <h2 className="text-2xl font-semibold mb-2">{blogData?.title}</h2>
                {isEdit && (
                  <div className="px-6 py-2">
                    <button onClick={handleEditClick} className="text-blue-500 hover:text-blue-300 font-semibold focus:outline-none">
                      <FaEdit />
                      <span className="ml-1">Edit</span>
                    </button>
                  </div>
                )}
              </div>
              <div className='flex items-center content-start gap-3'>
                <Link to={isAuth ? '/profile' : `/user-profile/${blogData?.author?.userName}`}>
                  <div className='flex gap-2 items-center'>
                    <img className="h-7 w-7 rounded-full border-black border-2 transform hover:scale-105 transition-transform duration-300" src={blogData?.author?.profilePic} alt="User avatar" />
                    <p className="text-gray-600 underline">{blogData?.author?.fullName}</p>
                  </div>
                </Link>
                <p>.</p>
                <p className='text-gray-600'>{istTime}</p>
              </div>
              <div className=' text-2xl font-bold ml-3 mt-5'>
                <span> {blogData?.tittle}</span>
              </div>
              <div
                className="text-gray-700 leading-relaxed ql-editor ql-header"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blogData?.content) }}
              ></div>
            </div>
            <div className="px-6 py-4 flex justify-between items-center">
              <div className="flex flex-wrap">
                {blogData?.tags?.map((tag, index) => (
                  <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className='flex items-center'>
                <button onClick={uploadLike} className={`p-1 flex items-center ${isAuthenticated() ? '' : 'pointer-events-none'}`}>
                  {isLiked ? (
                    <AiFillLike style={{ fontSize: '24px' }} />
                  ) : (
                    <AiOutlineLike style={{ fontSize: '24px' }} />
                  )}
                </button>
                <span onClick={openModal} className={`text-gray-700 cursor-pointer underline`}>{blogData?.likes.length}</span>
              </div>
            </div>

            <CommentForm blogId={id} />
          </div>
          {editButton && <EditBlog onChildUpdate={() => setFetchTrigger(prev => prev + 1)} blog={blogData} onClose={handleEditFormClose} />}
        </div>
      )}

      {(isModalOpen && likes.length > 0) && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex justify-center items-center">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <div className="relative z-50 bg-white rounded-lg max-w-lg mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Liked by</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul>
              {likes.map((like, index) => (
                <li key={index} className="flex items-center mb-2">
                  <Link className='flex items-center mb-2' to={`/user-profile/${like.userName}`}>
                    <img className="h-8 w-8 rounded-full mr-2" src={like.profilePic} alt="User avatar" />
                    <p className="text-gray-700">{(like.fullName === userDetails.fullName) ? 'You': like.fullName}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Blog;