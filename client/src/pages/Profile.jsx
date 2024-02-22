import React, { useRef, useState, useEffect } from 'react'
import { useSelector } from 'react-redux' 
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'
import { app } from '../firebase';
import { deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserFailure, signOutUserStart, signOutUserSuccess, updateUserFailure, updateUserStart, updateUserSuccess } from '../redux/user/userSlice';
import{useDispatch} from 'react-redux';
import { Link } from 'react-router-dom';
export default function Profile() {
  const fileRef=useRef(null);
  const{currentUser}=useSelector((state)=>state.user)//to use from redux store 
  const[file,setFile]=useState(undefined);
  const[filePerc,setFilePerc]=useState(0);
  const[fileUploadError,setFileUploadError]=useState(false);
  const[formData,setFormData]=useState({});
  const{loading,error}=useSelector((state)=>state.user);//to use from redux store
  const[showListingsError,setShowListingsError]=useState(false);
  const[userListings,setUserListings]=useState([]);
  const dispatch=useDispatch();
  //console.log(file);
  //firebase storage
  //allow read;
      //allow write:if
      //request.resource.size<2*1024*1024&&
      //request.resource.contentType.matches('image/.*')
  useEffect(()=>{
    if(file){
      handleFileUpload(file);
    }
  },[file])

  const handleFileUpload=(file)=>{ 
     const storage=getStorage(app);
     const fileName= new Date().getTime() + file.name;
     const storageRef=ref(storage,fileName);
     const uploadTask=uploadBytesResumable(storageRef,file);//for getting perc of upload its the main thing here.

     uploadTask.on('state_changed',
     (snapshot)=>{
      const progress=(snapshot.bytesTransferred/snapshot.totalBytes)*100;
      //console.log('Upload is'+progress+'% done');
      setFilePerc(Math.round(progress));
     },
     (error)=>{
       setFileUploadError(true);
     },
     ()=>{
      getDownloadURL(uploadTask.snapshot.ref).then
      ((downloadURL)=>{
       setFormData({...formData,avatar:downloadURL});
      })
     },
    );
  }
  const handleChange=(e)=>{
    setFormData({...formData, [e.target.id]:e.target.value});
  }
  const handleSubmit=async (e)=>{
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res=await fetch(`/api/user/update/${currentUser._id}`,{
        method:'POST',
        headers:{
        'Content-Type':'application/json',
        },
        body:JSON.stringify(formData),
       })
       const data= await res.json();
       if(data.success===false){
        dispatch(updateUserFailure(error.message));
       }
       dispatch(updateUserSuccess(data));
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  }
   const handleShowListings=async()=>{
    try {
      setShowListingsError(false);
      const res=await fetch(`/api/user/listings/${currentUser._id}`);
      const data=await res.json();
      if(data.success===false){
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
   }

   const handleListingDelete=async(listingId)=>{
      try {
        const res=await fetch(`/api/listing/delete/${listingId}`,{
          method:'DELETE',
        })
        const data=await res.json();
        if(data.success===false){
          console.log(data.message);
          return;
        }
        setUserListings((prev)=>prev.filter((listing)=>listing._id!==listingId));//to update on screen on the spot.
      } catch (error) {
        console.log(error.message);
      }
   }
   const handleDeleteUser=async()=>{
    try {
      dispatch(deleteUserStart());
      const res=await fetch(`/api/user/delete/${currentUser._id}`,{
        method:'DELETE',
         
      })
      const data=await res.json();
      if(data.success===false){
        dispatch(deleteUserFailure(data.message));
        return; 
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }

   }
   const handleSignOut=async()=>{
      try {
        dispatch(signOutUserStart());
        const res=await fetch("/api/auth/signout");
        const data=await res.json();
        if(data.success===false){
          dispatch(signOutUserFailure(data.message));//data.message her bcs the data is an error here.
          return;
        }
        dispatch(signOutUserSuccess(data));
      } catch (error) {
        dispatch(signOutUserFailure(error.message)); 
      }
   }
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-bold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input onChange={(e)=>setFile(e.target.files[0])} type='file' ref={fileRef} hidden accept='image/*' />
        <img onClick={()=>fileRef.current.click()} src={formData.avatar||currentUser.avatar} alt='profile pic' className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'/>
        <p className='text-sm self-center'>
          {fileUploadError?
          (<span className='text-red-700'>Error Image Upload(image must be less than 2mb)</span>):
          filePerc>0&&filePerc<100?
          (<span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>):
          filePerc===100?(
            <span className='text-green-700'>Image Uploaded Successfully!</span>):
            ('')
            }

        </p>
        <input type='text' placeholder='username' className='border p-3 rounded-lg' id='username' defaultValue={currentUser.username} onChange={handleChange}/>
        <input type='text' placeholder='email' className='border p-3 rounded-lg' id='email' defaultValue={currentUser.email} onChange={handleChange}/>
        <input type='password' placeholder='password' className='border p-3 rounded-lg' id='password' onChange={handleChange}/>  
        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>
          {loading?'Updating':'Update'} 
        </button>
        <Link className='uppercase rounded-lg text-white bg-green-700 p-3 text-center hover:opacity-95' to={'/create-listing'}>
          Create Listing
        </Link>
      </form>

      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete Account</span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign Out</span> 
      </div>
      <p className='text-red-700'>{error?error:""}</p>
      <button onClick={handleShowListings} className='text-green-700 w-full'>Show listings</button>
      <p className='text-red-700 mt-5'>{showListingsError?'Error Showing Listings':''}</p>

      {userListings&&userListings.length>0&&
      <div className="flex flex-col gap-4"> 
        <h1 className='text-center my-7 text-2xl font-semibold'>Your Listings</h1>
      {userListings.map((listing)=>
        <div key={listing._id} className='border rounded-lg p-3 flex justify-between items-center gap-4'> 
          <Link to={`/listing/${listing._id}`}>
            <img className='h-16 w-16 object-contain' src={listing.imageUrls[0]} alt='listing cover'/>
          </Link>
          <Link className='text-slate-700 font-semibold hover:underline truncate flex-1' to={`/listing/${listing._id}`}>
            <p>{listing.name}</p>
          </Link>

          <div className="flex flex-col items-center">
           <button onClick={()=>handleListingDelete(listing._id)} className='text-red-700 uppercase'>Delete</button> 
           <Link to={`/update-listing/${listing._id}`}>
           <button className='text-green-700 uppercase'>Edit</button>  
           </Link>
          </div>

        </div>
        
      )}
      </div>}
    </div> 
  )
}
