import React from 'react';
import { Link } from 'react-router-dom';

const NotAuthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4 text-red-500">Access Denied</h1>
      <p className="text-lg mb-4">You are not authorized to access this page.</p>
      <p className="text-lg mb-4">Please <Link to="/login" className="text-blue-500 underline">login</Link> or go back to <Link to="/" className="text-blue-500 underline">homepage</Link>.</p>
    </div>
  );
};

export default NotAuthorizedPage;
