import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import Header from '../components/Header';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const ChangePassword = () => {
    const navigate = useNavigate();
    const { logout, token } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        try {
            setLoading(true);
            const response = await axios.post(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/change-password`, {
                oldPassword,
                newPassword,
                confirmPassword
            }, { headers: headers });

            console.log("Success Response:", response?.data?.status);  // Log to check success response

            if (response?.data?.status) {
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setLoading(false);
                toast.success('Password changed successfully!');
                toast.success("Redirecting to login...");
                setTimeout(() => {
                    toast.loading("Redirecting to login...");  // Log before redirect
                    logout();
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            setLoading(false);
            console.error('Error changing password:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error?.response?.data?.message || 'An error occurred while changing the password.');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error('An error occurred while changing the password.');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        }
    };

    return (
        <>
            <Header />
            <div className="flex justify-center items-center h-screen w-full p-4 sm:p-6 md:p-8">
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
                    <Link to="/">
                        <div className='text-center text-2xl mb-5 text-cyan-500'>
                            <h1>Blog App</h1>
                        </div>
                    </Link>
                    <div className="text-center text-lg font-bold">Change your password</div>
                    <div className="mb-4 mt-8">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="oldPassword">
                            Old Password
                        </label>
                        <div className="relative">
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="oldPassword"
                                type={showOldPassword ? "text" : "password"}
                                placeholder="Old Password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                            <p
                                className="cursor-pointer absolute right-0 mr-2 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                            >
                                {showOldPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                            </p>
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                placeholder="New password"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <p
                                className="cursor-pointer absolute right-0 mr-2 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                            </p>
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <p
                                className="cursor-pointer absolute right-0 mr-2 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                            disabled={loading}
                        >
                            Change Password
                        </button>
                    </div>
                    <div className="mt-2">
                        <Link to="/forgot-password" className="text-blue-500 hover:text-blue-700">Forgot Password?</Link>
                    </div>
                </form>

                {/* Toaster Container */}
                <Toaster
                    toastOptions={{
                        success: {
                            position: 'top-right',
                        },
                        error: {
                            
                            position: 'top-right',
                        },
                        // Add other types of toast options if needed
                    }}
                />            </div>
        </>
    );
};

export default ChangePassword;
