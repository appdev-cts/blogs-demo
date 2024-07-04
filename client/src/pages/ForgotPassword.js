import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { MdEmail } from "react-icons/md";
import Header from '../components/Header';

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [isEmailSent, setIsEmailSent] = useState(false); // State for tracking if email is sent
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      const response = await axios.post(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/forgot-password`, {
        email: email,
      });
      console.log(response);
      setIsEmailSent(true);
      setTimeout(() => {
        navigate('/login')
      }, 4000) // Set state to show the popup
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setValidationErrors([error?.response?.data?.response?.message]);
        setTimeout(() => {
          setValidationErrors([]);
        }, 2000);
      } else {
        setValidationErrors(['An error occured.']);
        setTimeout(() => {
          setEmail('')
          setValidationErrors([]);
        }, 1000);
      }
    } finally {
      setLoading(false)
    }
  };

  return (
    <>
      <Header/>
      <div className="flex justify-center items-center min-h-screen min-w-full p-4">
        <form noValidate onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
          <Link to='/'>
            <div className='text-center text-2xl mb-5 text-cyan-500'>
              <h1>Blog App</h1>
            </div>
          </Link>
          <div className="mb-4">
            <span className="block text-gray-700 text-sm font-bold mb-2">
              Enter your your user account's verified email address and we will send you a password reset link.
            </span>
            <label className=" flex items-center gap-2 text-gray-700 text-sm font-bold mb-2 mt-5" htmlFor="email">
              <MdEmail /> Email
            </label>
            <input
              className="shadow  appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              {loading ? 'Sending email...' : 'Send Email'}
            </button>
          </div>
        </form>
        {validationErrors.length > 0 && (
          <div

            className="fixed top-24 right-0  mr-4 bg-red-500 text-white p-4 rounded shadow z-50"
          >
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {isEmailSent && (
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-8 rounded-md shadow-md">
              <h2 className="text-lg font-semibold mb-4">Email Sent!</h2>
              <p className="text-gray-700">Check your email inbox for further instructions.</p>
            </div>
          </div>
        )}
      </div>

    </>
  );
};

export default ForgotPassword;
