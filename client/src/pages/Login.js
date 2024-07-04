import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
    const { login, storeUser } = useAuth(); // Access login and storeUser from AuthContext
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        return () => {
            toast.dismiss(); // Clear all toasts on unmount
        };
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form inputs if necessary
        if (!email || !password) {
            setLoading(false)
            toast.error('Email and password are required.');
            return;
        }

        setLoading(true);

        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/login-user`,
                    {
                        email: email,
                        password: password
                    }
                );
                console.log('Login successful:', response.data);
                login(response?.data?.response); // Set token using login function from AuthContext
                storeUser(response?.data?.response?.fullName);
                resolve('Login successful!');
            } catch (error) {
                setLoading(false);
                console.error('Error logging in:', error);
                reject(error?.response?.data?.message || 'An error occurred during login.');
            } 
        });

        toast.promise(
            promise,
            {
                loading: 'Signing in...',
                success: 'Login successful!',
                error: (error) => error || 'An error occurred during login.',
            },
            {
                style: {
                    minWidth: '250px',
                },
            }
        );

        promise.then(() => {
            setTimeout(() => {
                navigate('/dashboard'); // Redirect to dashboard page
            }, 2000);
        }).catch(() => {
            // Handle additional error cases if needed
        });
    };

    return (
        <div className="flex w-full justify-center items-center mt-10 p-4">
            <form noValidate onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
                <h1 className="text-center text-lg mb-4 text-cyan-500">Log in to Blog App</h1>
                <div className="mb-4">
                    <label className="text-gray-700 text-sm font-bold mb-2 flex items-center gap-2" htmlFor="email">
                        <MdEmail /> Email
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        <RiLockPasswordFill /> Password
                    </label>
                    <div className="relative">
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <p
                            className="cursor-pointer absolute right-0 mr-2 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <div role="status">
                                <svg
                                    aria-hidden="true"
                                    className="w-4 h-4 me-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"
                                    />
                                </svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                    <Link to="/register" className="underline text-sm">Not a User? Register</Link>
                </div>
                <div className="mt-4 flex justify-end">
                    <Link to="/forgot-password" className="underline text-sm">Forgot Password?</Link>
                </div>
            </form>
            <Toaster 
                toastOptions={{
                    success:{
                        position: 'top-right',
                    },
                    loading:{
                        position:'top-right',
                    },
                    error: {
                        position: 'top-right',
                    }
                }}
            />
        </div>
    );
};

export default Login;
