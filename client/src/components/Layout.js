import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const Layout = () => {
  return (
    <>
      <Header />
      <div className='flex'>
          <>
            <Sidebar />
            <div className="ml-64 flex-1 flex items-center justify-center">
              <Outlet />
            </div>
          </>
      
      </div>
    </>
  )
}

export default Layout