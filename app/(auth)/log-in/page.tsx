'use client'

import { useState } from 'react'
import Link from "next/link";
import InputField from '../../components/InputField'
import Button from '../../components/button'
import AuthLayout from '../authlayout'
import { supabase } from "@/lib/supabaseClient";

const LogIn = () => {
    const [formData, setFormData] = useState({
      email: '',
      password: ''
     });    
    const [error , setError] = useState("");    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      })
    }

  const handlesubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const {data,error} = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      if (error) {
        setError(error.message);
        console.error("Login Error:", error.message);
      } else {
        console.log("Login Successful:", data);
        const userId = data.user?.id;
        const {data:userRoleData} = await supabase.from('users').select('role').eq('id', userId).single();
        const role = userRoleData?.role
        console.log("User ID:", userId);
        if (userId) {
          localStorage.setItem("userId", userId);
          console.log('The role is : ',role);
          if(role == "admin"){
            window.location.href = "/admin";
          }else if(role == "interviewer"){
            window.location.href = "/interviewer";
          }else{
            window.location.href = "/";
          }
        }
      }
    }

  return (
    <>
    <AuthLayout>
        <form onSubmit={handlesubmit}>
            <div className='flex items-center justify-center min-h-screen '> 
                <div className="max-w-md w-full mx-auto p-6 bg-white  shadow-md rounded-lg space-y-4 justify-center align-middle">
                        <h1 className="text-2xl font-semibold text-gray-800 text-center">Log In</h1>
                        <p className="text-sm text-gray-500 text-center">Please fill in your credentials to log in.</p>
                        <p className="text-red-500 text-center">{error}</p>
                        <InputField 
                            label="Email"
                            placeholder="Enter your Email"
                            type='email'
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                        <InputField 
                            label="Password"
                            placeholder="Enter your Password"
                            type='password'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                        <div className='flex flex-col space-y-4 '>
                            <Button text="Log In" onClick={() => {}}/>
                            <p className="text-sm text-center text-gray-600">
                                Don&apos;t have an account?
                                <Link href="/sign-up" className="text-blue-500 hover:underline">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                </div>  
            </div>        
        </form>
        </AuthLayout>
    </>
  )
}

export default LogIn