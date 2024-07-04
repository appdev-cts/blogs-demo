import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <Link to="/">
        <h1 className='text-4xl font-bold text-cyan-500 mb-4'>Blog App</h1>
      </Link>
      <h1 className="text-2xl font-bold text-red-500 mb-4">404 - Not Found</h1>
      <p className="text-lg text-gray-700">The page you are looking for does not exist.</p>
    </div>
  );
};

export default NotFoundPage;
