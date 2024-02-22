import React, { useState } from 'react'
import {Link,useNavigate} from 'react-router-dom';
import{useDispatch, useSelector} from 'react-redux';
import{signInStart,signInSuccess,signInFailure} from '../redux/user/userSlice';
import Oauth from '../components/OAuth';

export default function SignIn() {
  const[formData,setFormData]=useState({});
  const{loading,error}=useSelector((state)=>state.user);// to initialise the vars to their initialstae values

  //const[error,setError]=useState(null);
  //const[loading,setLoading]=useState(false);

  const navigate=useNavigate();
  const dispatch=useDispatch();

  const handleChange=(e)=>{
    setFormData({
      ...formData,//to keep prev form data intact
      [e.target.id]: e.target.value,
    })

  }

  const handleSubmit= async(e)=>{
     e.preventDefault();
     try {
      dispatch(signInStart());
     const res= await fetch('/api/auth/signin',
      { 
         method:'POST',
         headers:{
          'Content-Type':'application/json',
         },
         body:JSON.stringify(formData),
      }
     )
     const data= await res.json();
     if(data.success===false){
      dispatch(signInFailure(data.message));
      return;
     }
     dispatch(signInSuccess(data));
     navigate('/'); 
     } catch (error) {
      dispatch(signInFailure(error.message));
     }
     
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-bold my-7'> Sign in</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input type='text' placeholder='email'className='border p-3 rounded-lg' id='email' onChange={handleChange}/> 
        <input type='text' placeholder='password'className='border p-3 rounded-lg' id='password' onChange={handleChange}/> 
        <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>{loading?'Loading...':'Sign In'}
        </button>
        <Oauth/>
      </form>

      <div className='flex mt-3 gap-2'>
        <p>Don't have an account?</p>
        <Link to={"/sign-up"} className='text-blue-700'> 
          <span>Sign up</span>
        </Link>
      </div>
      {error && <p className='text-red-500 mt-5'>{error}</p>}
    </div>
  )
}
