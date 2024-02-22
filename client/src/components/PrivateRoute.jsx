import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
  const {currentUser}=useSelector((state)=>state.user);//this line is to access the currentUser variable from redux.
  //Outlet lets the inner route in the app.jsx to be rendered
  return currentUser? <Outlet/>:<Navigate to={'/sign-in'}/>

}
