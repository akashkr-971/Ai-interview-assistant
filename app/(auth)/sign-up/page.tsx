'use client'

import React, { useState } from 'react';
import Link from "next/link";
import InputField from '../../components/InputField'
import Button from '../../components/button'
import AuthLayout from '../authlayout'
import { supabase } from "@/lib/supabaseClient";

const SignIn = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    if(formData.password !== formData.confirmPassword){
      setError('Password do not match')
      return;
    }
    const {data ,error} = await supabase.auth.signUp({
      
      email: formData.email,
      password: formData.password
    });
    if(error){
      console.error("Auth Signup Error:", error.message);
      setError(error.message)
      return;
    }
    if(data.user){
      const {error: dberror} = await supabase.from('users').insert([
        { id: data.user.id,name: formData.name, email: formData.email }
      ]);
      if(dberror){
        console.error("Inserting user data Error:", dberror.message);
        setError(dberror.message)
        return;
      }
      if (!dberror) {
        localStorage.setItem("userId", data.user.id);
        console.log("User signed up successfully:", data.user.id);
        window.location.href = '/';
      }
    }
  }

  return (
    <>
    <AuthLayout>
      <form onSubmit={handlesubmit}>
        <div className='flex items-center justify-center min-h-screen'>
          <div className="max-w-md w-full mx-auto p-6 bg-white shadow-md rounded-lg space-y-4 justify-center align-middle">
              <h1 className="text-2xl font-semibold text-gray-800 text-center">Sign Up</h1>
              <p className="text-sm text-gray-500 text-center">Please fill in your credentials to sign Up.</p>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <InputField 
                  label="Name"
                  placeholder="Enter your name here"
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
              />
              <InputField 
                  label="Email"
                  placeholder="Enter your Email"
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
              />
              <InputField 
                  label="Password"
                  placeholder="Enter your Password"
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
              />
              <InputField 
                  label="Confirm Password"
                  placeholder="Confirm your Password"
                  type='password'
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
              />
              <div className='flex flex-col space-y-4 '>
                <Button text="Sign Up"/>
                <p className="text-sm text-center text-gray-600">
                    Already have an account?{" "}
                    <Link href="/log-in" className="text-blue-500 hover:underline">
                        Log In
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

export default SignIn