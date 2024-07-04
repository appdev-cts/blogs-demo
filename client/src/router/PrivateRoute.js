import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' 
const PrivateRoute = () => {
  const {isAuthenticated, isNotFoud} = useAuth()
  if(!isAuthenticated()) return <Navigate to='/login'/>;
  if(isNotFoud) return <Navigate to = '*'/>
  return <Outlet/>
}

export default PrivateRoute