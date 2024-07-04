import axios from 'axios';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useAuth } from '../context/AuthContext';
const ResetPassword = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { token } = useParams()
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to toggle password visibility
  const [showNewPassword, setShowNewPassword] = useState(false); // State to toggle password visibility
  const [isSaved, setIsSaved] = useState(false);

  const [validationErrors, setValidationErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you can perform any action with newPassword and confirmPassword
    const objectPassword = {
      newPassword, confirmPassword
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/reset-password/${token}`, objectPassword)
      setIsSaved(true)
      const timer = setInterval(() => {
        if (response?.data?.status) {
          navigate('/login')
          logout()
        }
      }, 2000);
      return () => { clearInterval(timer) }
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setValidationErrors([error.response.data.message]);
        setTimeout(() => {
          setValidationErrors([]);
        }, 2000);
      } else {
        setValidationErrors(['An error occured.']);
        setTimeout(() => {
          setValidationErrors([]);
        }, 1000);
      }
    }
    // Reset the input fields after submitting the form
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="w-full flex flex-col justify-center items-center min-h-screen px-4">
  <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full md:w-1/2 lg:w-1/3">
    <div className="mb-4">
      <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
      <div className='relative'>
        <input
          id="newPassword"
          type={showNewPassword ? "text" : "password"}
          placeholder="New password"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <p
          className=" cursor-pointer absolute right-0 mr-2 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
          onClick={() => setShowNewPassword(!showNewPassword)} // Toggle showPassword state
        >
          {showNewPassword ? <FaRegEyeSlash /> : <FaRegEye />} {/* Change button text based on showPassword state */}
        </p>
      </div>
    </div>
    <div className="mb-6">
      <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
      <div className='relative'>
        <input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <p
          className=" cursor-pointer absolute right-0 mr-2 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle showPassword state
        >
          {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />} {/* Change button text based on showPassword state */}
        </p>
      </div>
    </div>
    <div className="flex items-center justify-center md:justify-between">
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Reset Password
      </button>
    </div>
  </form>
  {isSaved && (
    <div className="absolute top-0 right-0 m-4 bg-green-500 text-white p-4 rounded shadow">Password Changed Successfully!!</div>
  )}
  {validationErrors.length > 0 && (
    <div className="absolute top-0 right-0 m-4 bg-red-500 text-white p-4 rounded shadow">
      <ul>
        {validationErrors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  )}
</div>


  );
};

export default ResetPassword;
