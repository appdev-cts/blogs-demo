import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DateTime } from 'luxon'
import { Link } from 'react-router-dom';
import io from 'socket.io-client';

const CommentForm = (props) => {
  const { token, isAuthenticated, user } = useAuth();
  const { blogId } = props;
  const [commentsData, setCommentsData] = useState('')
  const [formData, setFormData] = useState('');
  const [newComment, setNewComment] = useState(''); // State to store the newly submitted comment
  const [loading, setLoading] = useState(true)
  const [validationErrors, setValidationErrors] = useState([]); // State for validation errors
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [liveComment, setLiveComment] = useState([]);

  const handleChange = (e) => {
    setFormData(e.target.value);
  };
  const fetchComments = async () => {
    try {
      const response = await axios.get( `${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/allComments/${blogId}`);
      // console.log(response?.data?.response);
      setNewComment(response?.data?.response)
      setCommentsData(response?.data?.response)
      setLoading(false)
      console.log(response?.data?.response);
    } catch (error) {
      console.log(error);
    }
  }
  // const {author, comments} = commentsData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = {
      'Authorization': `Bearer ${token}` // Replace token with your actual token value
    };
    try {
      const response = await axios.post( `${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/comment/${blogId}`, { text: formData }, { headers: headers });
      setNewComment(formData); // Set the newly submitted comment to display it immediately
      setFetchTrigger(prev => prev + 1)
      setFormData(''); // Clear the form data after submission
    } catch (error) {
      if (error?.response && error?.response?.data && error?.response?.data?.message) {
        console.log(error?.response?.data?.message);
        setValidationErrors([error?.response?.data?.message]);
        setTimeout(() => {
          setValidationErrors([]);
        }, 2000);
      } else {
        setValidationErrors(['An error occurred during login.']);
      }
    }
  };
  const { comments } = commentsData;
  // console.log(comments);
  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_SERVER_IP_ADDRESS}`); // Adjust the URL if your server is hosted elsewhere
    // Join a room specific to this blog post
    socket.emit('joinBlog', { blogId: blogId });
    // Listen for like updates
    socket.on('commentUpdate', (updatedComment) => {
      // console.log(updatedComment)
      setLiveComment(updatedComment)
    });
    // Clean up on component unmount
    return () => {
      socket.emit('leaveBlog', { blogId: blogId });
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    fetchComments()
  }, [fetchTrigger])
  const allComments = liveComment.length === 0 ? comments : liveComment;
  console.log(liveComment);
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
    <>
      {loading ? (
        <div className='flex items-center justify-normal'><div role="status">
          <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
          <span class="sr-only">Loading...</span>
        </div>
        </div>
      ) : (
        <div>
          {isAuthenticated() ? (<>
            <div className='flex gap-2 mt-5 px-6 py-4'>
              <form onSubmit={handleSubmit} className='flex gap-2'>
                <input value={formData} name="text" className='w-96 p-4 border' type="text" onChange={handleChange} placeholder='Enter your comment' />
                <button type='submit' className='border p-4 gap-2 bg-green-400 text-white'>Comment</button>
              </form>
              {validationErrors.length > 0 && (
                <div className="absolute top-0 right-0 m-4 bg-red-500 text-white p-4 rounded shadow">

                  {validationErrors.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}

                </div>
              )}
            </div>
            <div className='px-6 py-4'>
              <div className='mb-5'>Comments: {allComments.length}</div>
              {
                allComments.length === 0 ?
                  (<p className='text-center'>No comments</p>) :
                  (
                    <>
                      {(allComments
                        .sort((a, b) => {
                          // If 'user' exists and 'a' is authored by the user, place 'a' first
                          if (user && a.author.fullName === user) return -1;
                          // If 'user' exists and 'b' is authored by the user, place 'b' first
                          if (user && b.author.fullName === user) return 1;
                          // Otherwise, maintain the order based on the original comment order
                          return 0;
                        })
                        .map((comment, index) => {
                          const { userName, fullName, profilePic } = comment?.author;
                          const { text, date } = comment;
                          
                          return (
                            <div className='border-b-2 w-full p-3 gap-5 flex justify-between items-center' key={index}>
                            <div className='flex items-center  w-2/3'>
                              <img 
                                src={profilePic} 
                                alt={`${fullName}'s profile picture`} 
                                className='w-5 h-5 rounded-full' 
                              />
                              <p><Link to={`/user-profile/${userName}`}>
                                <strong className='text-sm hover:underline mx-3'>{fullName}-</strong>{text} 
                              </Link></p>
                            </div>
                            <span>{timeAgo(date)}</span>
                          </div>
                          
                          );
                        }))}

                    </>
                  )

              }
            </div></>) : (<>
              <div className='px-6 py-4'>
                <div className='mb-5'>Comments: {allComments.length}</div>
                {
                 allComments.length === 0 ?
                    (<p className='text-center'>No comments</p>) :
                    (
                      <>
                        {allComments.map((comment, index) => {
                          const { fullName } = comment?.author;
                          const { text, date } = comment;
                          const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                          const istTime = DateTime.fromISO(date).setZone(userTimeZone).toLocaleString(DateTime.TIME_SIMPLE); // Convert date to IST time only
                          return (
                            <div className='border-b-2 w-full p-3 gap-5 flex justify-between items-center' key={index}>
                              <p className='w-2/3'>{text}<strong className=' text-xs mx-2'>-{fullName}</strong></p>
                              <span>{istTime}</span>
                            </div>
                            
                          );
                        }
                        )
                        }
                      </>
                    )

                }
              </div>
            </>
          )
          }


        </div>

      )}
    </>
  );

};

export default CommentForm;


