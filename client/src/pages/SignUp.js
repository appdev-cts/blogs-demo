import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { countryCodes } from '../utils/constants';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; // Import toast and Toaster

const SignUp = () => {
    const errorRef = useRef(null);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        userName: '',
        gender: '',
        email: '',
        phoneNumber: '',
        password: '',
        countryCode: '',
        profilePic: null // Changed to null to hold file object
    });
    const [validationErrors, setValidationErrors] = useState([]);
    const [registered, setRegistered] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            profilePic: e.target.files[0] // Store the selected file
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Create FormData object and append form data
        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            formDataToSend.append(key, formData[key]);
        });

        await axios.post(`${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/sign-up`, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                console.log('Registration successful:', response.data);
                toast.success('Registered Successfully'); // Show success notification
                setRegistered(true);
                setLoading(false);
                const timer = setTimeout(() => {
                    setRegistered(false);
                    navigate('/login'); // Redirect to login page after registration
                }, 3000);
                return () => { clearTimeout(timer) };
            })
            .catch(error => {
                console.error('Error registering user:', error);
                if (error?.response?.data?.message) {
                    toast.error(error?.response?.data?.message); // Show error notification
                    setLoading(false);
                } else {
                    toast.error(error?.response?.data?.error || 'An error occurred'); // Show error notification
                    setLoading(false);
                }
            });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-5">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 py-8 w-full">
                <div className="text-lg text-center mb-4 text-cyan-500">Join our Blog App</div>
                <div className="mb-4">
                    <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
                        First Name
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="First Name"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
                        Last Name
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Last Name"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="userName" className="block text-gray-700 text-sm font-bold mb-2">
                        User Name
                    </label>
                    <input
                        type="text"
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="User Name"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="gender" className="block text-gray-700 text-sm font-bold mb-2">
                        Gender
                    </label>
                    <div className="flex items-center gap-7">
                        <label htmlFor="male" className="flex gap-1">
                            <input
                                type="radio"
                                id="male"
                                name="gender"
                                value="male"
                                checked={formData.gender === 'male'}
                                onChange={handleChange}
                            />
                            Male
                        </label>
                        <label htmlFor="female" className="flex gap-1">
                            <input
                                type="radio"
                                id="female"
                                name="gender"
                                value="female"
                                checked={formData.gender === 'female'}
                                onChange={handleChange}
                            />
                            Female
                        </label>
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Email"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="countryCode" className="block text-gray-700 text-sm font-bold mb-2">
                        Country Code
                    </label>
                    <select
                        id="countryCode"
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option>Select Country Code</option>
                        {countryCodes.map((country, index) => (
                            <option key={index} value={country.code}>{`${country.code} (${country.name})`}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
                        Phone Number
                    </label>
                    <input
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Phone Number"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Password"
                        />
                        <p
                            className="absolute right-0 mr-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                        </p>
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="profilePic" className="block text-gray-700 text-sm font-bold mb-2">
                        Profile Picture
                    </label>
                    <input
                        type="file"
                        id="profilePic"
                        name="profilePic"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            <div className="mt-4">
                <Link to="/login" className="text-blue-500 hover:underline">Already have an account? Login</Link>
            </div>
            <Toaster 
                toastOptions={{
                    success:{
                        position: 'top-right'
                    },
                    error:{
                        position:'top-right'
                    },
                    loading:{
                        position: 'top-right'
                    }
                }}
                    
            /> {/* Include Toaster component to display notifications */}
        </div>
    );
};

export default SignUp;
