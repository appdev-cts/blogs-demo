import React, {  useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { countryCodes } from '../utils/constants';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link } from 'react-router-dom';

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
    // const [showPopup, setShowPopup] = useState(false);
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

        await axios.post( `${process.env.REACT_APP_SERVER_IP_ADDRESS}/api/users/sign-up`, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                console.log('Registration successful:', response.data);
                // setShowPopup(true);
                setRegistered(true)
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
                    setValidationErrors([error?.response?.data?.message]);
                    errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setLoading(false);
                    const timer = setTimeout(() => {
                        setValidationErrors([]);
                    }, 3000); // Clear validation errors after 3 seconds
                    return () => { clearTimeout(timer) };
                } else {
                    // Handle other 
                    console.log(error);
                    setLoading(false);
                    setValidationErrors([error?.response?.data?.error]);
                    const timer = setTimeout(() => {
                        setValidationErrors([]);
                    }, 3000); // Clear validation errors after 3 seconds
                    return () => { clearTimeout(timer) };
                }
            });
    };

    // useEffect(() => {
    //     if (validationErrors.length > 0 && errorRef.current) { // Check if errorRef.current exists
    //         errorRef.current.scrollIntoView({ behavior: 'smooth' });
    //     }
    // }, [validationErrors]);

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
                    <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
                        User Name
                    </label>
                    <input
                        type="text"
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="User Name  "
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
                        <option >Select Country Code</option>
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
                            {showPassword ? <FaRegEye /> :<FaRegEyeSlash /> }
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
                <div className="flex justify-between items-center">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled= {loading}
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
                            'Register'
                        )}
                    </button>
                    <div className="underline">
                        <Link to="/login">Already a user? Sign In</Link>
                    </div>
                </div>
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
            </form>

            {loading && (
                <div className="fixed top-24 right-0 m-4 bg-green-500 text-white p-4 rounded shadow">
                    <div role="status" className='flex gap-3 items-start'>
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
                        <p>Registring</p>

                    </div>
                </div>
            )}
            {registered && (
                <div className="fixed top-24 right-0 m-4 bg-green-500 text-white p-4 rounded shadow">
                    Registered Successfully
                </div>
            )}
        </div>
    );
};

export default SignUp;
